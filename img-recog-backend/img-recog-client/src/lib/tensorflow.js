import * as tf from "@tensorflow/tfjs";
import { CLASSES } from "./classes.js";

export async function detectObjects(img, ctx) {
  console.log("Loading...");

  await tf.ready();

  // Mobilenet is low-latency, low-power object detection and classification model created by the Google AI team
  // SSD or single-shot detector uses a fully convolutional neural network and is combined with MobileNet  using control flow
  const modelPath =
    "https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1";

  const model = await tf.loadGraphModel(modelPath, { fromTFHub: true });
  const imgTensor = tf.browser.fromPixels(img);
  const detectionResults = {}; // store detected object class and score here

  const readyfiedImgTensor = tf.expandDims(imgTensor, 0); // convert to single batch
  const results = await model.executeAsync(readyfiedImgTensor);

  // Choose parameters
  const detectionThreshold = 0.4;
  const iouThreshold = 0.5; // intersection over union - used to recognize overlapping bounding boxes that describe the same object - used with NMS
  const maxBoxes = 20;

  // Get most significant results
  const prominentDetection = tf.topk(results[0]);
  const justBoxes = results[1].squeeze();
  const justValues = prominentDetection.values.squeeze();

  // Move results into JS form
  const [maxIndices, scores, boxes] = await Promise.all([
    prominentDetection.indices.data(),
    justValues.array(),
    justBoxes.array(),
  ]);

  const nmsDetections = await tf.image.nonMaxSuppressionWithScoreAsync(
    justBoxes, // [numBoxes, 4]
    justValues, // [numBoxes]
    maxBoxes,
    iouThreshold,
    detectionThreshold,
    1 // 0 is the default NMS, 1 is enables Soft-NMS which helps with overlapping objects
  );

  const objectData = await nmsDetections.selectedIndices.data();

  tf.dispose([
    results[0],
    results[1],
    model,
    nmsDetections.selectedIndices,
    nmsDetections.selectedScores,
    prominentDetection.indices,
    prominentDetection.values,
    imgTensor,
    readyfiedImgTensor,
    justBoxes,
    justValues,
  ]);

  objectData.forEach((detection) => {
    ctx.strokeStyle = "#66b3ff";
    ctx.lineWidth = 4;
    const detectedIndex = maxIndices[detection];
    const detectedClass = CLASSES[detectedIndex];
    const detectedScore = scores[detection];
    const dBox = boxes[detection];

    if (
      !detectionResults[detectedClass] ||
      detectionResults[detectedClass] < detectedScore
    ) {
      detectionResults[detectedClass] = detectedScore;
    }

    // Bounding box
    ctx.globalCompositeOperation = "destination-over";
    const startY = dBox[0] > 0 ? dBox[0] * img.height : 0;
    const startX = dBox[1] > 0 ? dBox[1] * img.width : 0;
    const height = (dBox[2] - dBox[0]) * img.height;
    const width = (dBox[3] - dBox[1]) * img.width;
    ctx.strokeRect(startX, startY, width, height);

    // Label Box
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#66b3ff";
    const textHeight = 18;
    const textPadding = 4;
    ctx.font = `bold ${textHeight}px consolas`;
    ctx.textBaseline = "hanging";
    const label = `${detectedClass} ${Math.round(detectedScore * 100)}%`;
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(
      startX,
      startY,
      textWidth + textPadding,
      textHeight + textPadding
    );
    ctx.fillStyle = "#FFF";
    ctx.fillText(label, startX, startY);
  });

  return detectionResults;
}
