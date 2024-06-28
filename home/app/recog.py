from matplotlib.figure import Figure
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from PIL import Image, ImageOps
import numpy as np
from skimage.segmentation import slic, mark_boundaries
from skimage.util import img_as_float
from tensorflow import keras
import io

def predict_with_model(img):
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)

    image = img.convert("RGB")
    size = (224, 224)
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS)
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.5) - 1
    data[0] = normalized_image_array

    model = keras.models.load_model('models/all.h5')
    prediction = model.predict(data)
    index = np.argmax(prediction)
    class_names = ['mụn trứng cá', 'viêm da', 'nấm da', 'khỏe mạnh']
    selection = class_names[index]
    confidence_score = prediction[0][index]

    return {"class_name": selection, "confidence": confidence_score}


def recognize(img):
    skin_image = Image.fromarray(img).resize((224, 224))
    segments = slic(img_as_float(skin_image), n_segments=5, sigma=5)

    fig = Figure()
    canvas = FigureCanvas(fig)
    ax = fig.add_subplot(1, 1, 1)
    ax.imshow(mark_boundaries(img_as_float(skin_image), segments, background_label=0, mode='thick'))
    ax.axis("off")
    
    canvas.draw()
    superpixel_img = np.frombuffer(canvas.tostring_rgb(), dtype=np.uint8)
    superpixel_img = superpixel_img.reshape(fig.canvas.get_width_height()[::-1] + (3,))
    
    # Crop phần trung tâm 250x250 pixels
    height, width, _ = superpixel_img.shape
    center_x, center_y = width // 2, height // 2
    crop_size = 400

    # Tính toán tọa độ của vùng crop
    start_x = max(center_x - crop_size // 2, 0)
    start_y = max(center_y - crop_size // 2, 0)
    end_x = min(start_x + crop_size, width)
    end_y = min(start_y + crop_size, height)

    # Crop ảnh
    superpixel_img = superpixel_img[start_y:end_y, start_x:end_x]

    segment_results = []
    for i, segVal in enumerate(np.unique(segments)):
        mask = np.zeros(skin_image.size[:2], dtype="uint8")
        mask[segments == segVal] = 255
        extracted_mask = np.stack(np.nonzero(mask), axis=-1)
        im = Image.fromarray(mask)
        cropped_segment = im.crop((min(extracted_mask[:, 1]), min(extracted_mask[:, 0]), max(extracted_mask[:, 1]), max(extracted_mask[:, 0])))
        cropped_img_segment = skin_image.crop((min(extracted_mask[:, 1]), min(extracted_mask[:, 0]), max(extracted_mask[:, 1]), max(extracted_mask[:, 0])))
        temp = np.array(cropped_segment) / 255
        output = np.array(cropped_img_segment)

        for j in range(3):
            final_result = np.multiply(temp, (np.array(cropped_img_segment)[:, :, j]))
            output[:, :, j] = final_result
        final_seg = Image.fromarray(output)

        out = predict_with_model(final_seg)
        segment_results.append({"segment": i, "prediction": out['class_name'], "confidence": str(round(out['confidence']*100)), "image": output})

    return {"superpixel": superpixel_img, "segments": segment_results}
