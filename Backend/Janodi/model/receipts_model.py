import torch
from PIL import Image, ImageDraw, ImageFont
import easyocr
from transformers import LayoutLMv3Processor, LayoutLMv3ForTokenClassification
import matplotlib.pyplot as plt

def extract_receipt_structured_data(image_path):
    model_name = "janodis/layoutlmv3-finetuned-receipts"
    processor = LayoutLMv3Processor.from_pretrained(model_name, apply_ocr=False)
    model = LayoutLMv3ForTokenClassification.from_pretrained(model_name)
    id2label = model.config.id2label

    reader = easyocr.Reader(['en'])
    raw = reader.readtext(image_path)
    img = Image.open(image_path).convert("RGB")
    W, H = img.size

    tmp = []
    CONF_THRESH = 0.35
    for poly, text, conf in raw:
        if not text or conf < CONF_THRESH:
            continue
        xs = [p[0] for p in poly]
        ys = [p[1] for p in poly]
        x1, y1, x2, y2 = max(0, min(xs)), max(0, min(ys)), min(W, max(xs)), min(H, max(ys))
        tmp.append((text, [x1, y1, x2, y2]))

    def reading_order(entries, y_tol=0.015):
        lines = {}
        for t, (x1,y1,x2,y2) in entries:
            yc = (y1+y2)/2
            placed = False
            for k in list(lines.keys()):
                if abs(k - yc) <= y_tol*H:
                    lines[k].append((t, [x1,y1,x2,y2]))
                    placed = True
                    break
            if not placed:
                lines[yc] = [(t, [x1,y1,x2,y2])]
        ordered = []
        for k in sorted(lines.keys()):
            line = sorted(lines[k], key=lambda e: e[1][0])
            ordered.extend(line)
        return ordered

    ordered = reading_order(tmp)
    words = []
    boxes = []
    for t, (x1, y1, x2, y2) in ordered:
        b = [
            int(1000 * x1 / W),
            int(1000 * y1 / H),
            int(1000 * x2 / W),
            int(1000 * y2 / H),
        ]
        b = [min(1000, max(0, v)) for v in b]
        words.append(t)
        boxes.append(b)

    if len(words) == 0:
        raise ValueError("No OCR words after filtering. Lower CONF_THRESH or check the image.")

    encoding = processor(
        images=img,
        text=words,
        boxes=boxes,
        return_tensors="pt",
        padding="max_length",
        truncation=True,
        max_length=512,
    )

    with torch.no_grad():
        outputs = model(**encoding)

    logits = outputs.logits
    pred_ids = logits.argmax(-1).squeeze(0).tolist()
    word_ids = encoding.word_ids(batch_index=0)
    word_level_labels = []
    used = set()
    for tok_idx, widx in enumerate(word_ids):
        if widx is None or widx in used:
            continue
        used.add(widx)
        word_level_labels.append(id2label[pred_ids[tok_idx]])

    word_level_labels = word_level_labels[:len(words)]
    assert len(word_level_labels) == len(words), f"Mismatch: {len(word_level_labels)} vs {len(words)}"

    structured = {}
    for w, lab in zip(words, word_level_labels):
        structured.setdefault(lab, []).append(w)

    return structured

def display_image(image_path):
    img = Image.open(image_path).convert("RGB")
    plt.figure(figsize=(10, 14))
    plt.imshow(img)
    plt.axis("off")
    plt.show()

def display_image_with_boxes(image_path, boxes, labels=None):
    """
    Display image with bounding boxes.
    boxes: list of [x1, y1, x2, y2] in pixel coordinates
    labels: optional list of labels for each box
    """
    img = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    for i, box in enumerate(boxes):
        color = (255, 0, 0)  # red
        draw.rectangle(box, outline=color, width=2)
        if labels:
            label = labels[i]
            draw.text((box[0], max(0, box[1] - 16)), label, fill=color)
    plt.figure(figsize=(10, 14))
    plt.imshow(img)
    plt.axis("off")
    plt.show()


# Define 'contents' with the image data before writing to file
# For example, if you have an image file path, read its bytes:
image_file_path = "E:/test ds project/receipt images/1007-receipt.jpg"
with open(image_file_path, "rb") as img_file:
    contents = img_file.read()

structured_data = extract_receipt_structured_data(image_file_path)
print(structured_data)
display_image(image_file_path)

# Example usage:
# boxes = [[x1, y1, x2, y2], ...]
# labels = ["Title", "Address", ...]
# display_image_with_boxes("your_image_path.jpg", boxes, labels)