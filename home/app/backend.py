from flask import Flask, render_template, request, send_file, jsonify
import recog
import skimage
from PIL import Image
import numpy as np
import io
import os

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('home.html')

@app.route('/save-image', methods=['POST'])
def save_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image part in the request"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Đường dẫn tới folder history
    history_folder = 'history'

    if not os.path.exists(history_folder):
        os.makedirs(history_folder)

    # Số lượng ảnh có trong folder history
    image_count = len([name for name in os.listdir(history_folder) if os.path.isfile(os.path.join(history_folder, name))])

    # Lưu ảnh với tên mới
    file_path = os.path.join(history_folder, f"{image_count + 1}.jpg")
    file.save(file_path)

    return jsonify({"message": "Image saved successfully", "filename": f"{image_count + 1}.jpg"}), 200


@app.route('/perform-skin-recognition', methods=['POST'])
def handle_recog():
    # Nhận filename từ frontend
    filename = request.form.get('filename')

    # Đường dẫn tới ảnh gốc
    image_path = os.path.join('history', filename)
    image = skimage.io.imread(image_path)

    res = recog.recognize(image)

    # Lưu ảnh superpixel
    superpixel_path = os.path.join('test', filename)
    superpixel_img = Image.fromarray(res['superpixel'])
    superpixel_img.save(superpixel_path)

    # Lưu các phân đoạn ảnh
    segment_folder = os.path.join('segments', filename.split('.')[0])
    if not os.path.exists(segment_folder):
        os.makedirs(segment_folder)
    for i, segment in enumerate(res['segments']):
        class_name = segment['prediction']
        confidence = segment['confidence']
        segment_path = os.path.join(segment_folder, f"{i}_{class_name}_{confidence}.jpg")
        segment_img = Image.fromarray(segment['image'])
        segment_img.save(segment_path)

        # Lưu đường dẫn ảnh trong thông tin trả về
        segment['image'] = f"{i}_{class_name}_{confidence}.jpg"

    return jsonify(res['segments'])


@app.route('/images/<filename>')
def get_image(filename):
    img = skimage.io.imread(f"test/{filename}")
    img = Image.fromarray(img)
    file_object = io.BytesIO()
    img.save(file_object, 'JPEG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/jpeg')


@app.route('/segments/<folder>/<filename>')
def get_segment_image(folder, filename):
    img_path = os.path.join('segments', folder, filename)
    img = skimage.io.imread(img_path)
    img = Image.fromarray(img)
    file_object = io.BytesIO()
    img.save(file_object, 'JPEG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/jpeg')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
    
# cấu trúc thư mục:
# app/
# ├── backend.py 
# ├── recog.py                        
# ├── static/                        
# │   ├── style.css                  
# │   └── script.js                  
# ├── templates/                     
# │   └── home.html                 
# ├── history/                     
# ├── segments/               # chứa những thư mục ảnh nhỏ hơn 
# └── test/
