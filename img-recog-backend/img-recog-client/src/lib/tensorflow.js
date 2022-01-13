import * as tf from "@tensorflow/tfjs";
import { CLASSES } from "./classes.js";

export async function detectObjects(img, ctx) {
  console.log("Loading...");

  await tf.ready();
  const modelPath =
    "https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1";
  const model = await tf.loadGraphModel(modelPath, { fromTFHub: true });
  // const img = document.getElementById("imgContainer");
  const myTensor = tf.browser.fromPixels(img);
  const detectionData = {}; // store detected object class and score here

  // SSD Mobilenet single batch
  const readyfied = tf.expandDims(myTensor, 0);
  const results = await model.executeAsync(readyfied);

  // Prep Canvas
  // const { ctx, canvas } = getCanvas("detection");

  // Choose parameters
  const detectionThreshold = 0.4;
  const iouThreshold = 0.5;
  const maxBoxes = 20;

  // Get a clean tensor of top indices
  const prominentDetection = tf.topk(results[0]);
  const justBoxes = results[1].squeeze();
  const justValues = prominentDetection.values.squeeze();

  // Move results back to JavaScript in parallel
  const [maxIndices, scores, boxes] = await Promise.all([
    prominentDetection.indices.data(),
    justValues.array(),
    justBoxes.array(),
  ]);

  // https://arxiv.org/pdf/1704.04503.pdf, use Async to keep visuals
  const nmsDetections = await tf.image.nonMaxSuppressionWithScoreAsync(
    justBoxes, // [numBoxes, 4]
    justValues, // [numBoxes]
    maxBoxes,
    iouThreshold,
    detectionThreshold,
    1 // 0 is normal NMS, 1 is max Soft-NMS for overlapping support
  );

  const chosen = await nmsDetections.selectedIndices.data();
  // Mega Clean
  tf.dispose([
    results[0],
    results[1],
    model,
    nmsDetections.selectedIndices,
    nmsDetections.selectedScores,
    prominentDetection.indices,
    prominentDetection.values,
    myTensor,
    readyfied,
    justBoxes,
    justValues,
  ]);

  chosen.forEach((detection) => {
    ctx.strokeStyle = "#66b3ff";
    ctx.lineWidth = 4;
    const detectedIndex = maxIndices[detection];
    const detectedClass = CLASSES[detectedIndex];
    const detectedScore = scores[detection];
    const dBox = boxes[detection];

    if (
      !detectionData[detectedClass] ||
      detectionData[detectedClass] < detectedScore
    ) {
      detectionData[detectedClass] = detectedScore;
    }

    // Bounding box - No negative values for start positions
    ctx.globalCompositeOperation = "destination-over";
    const startY = dBox[0] > 0 ? dBox[0] * img.height : 0;
    const startX = dBox[1] > 0 ? dBox[1] * img.width : 0;
    const height = (dBox[2] - dBox[0]) * img.height;
    const width = (dBox[3] - dBox[1]) * img.width;
    ctx.strokeRect(startX, startY, width, height);

    // Label Box and Label Text
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
  return detectionData;
}

// function getCanvas(canvasId) {
//   const canvas = document.getElementById(canvasId);
//   const ctx = canvas.getContext("2d");
//   return { ctx, canvas };
// }

// function handleUpload(event) {
//   event.preventDefault();

//   if (!event.target.files.length) return;

//   const { ctx, canvas } = getCanvas("detection");
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   const imgContainer = document.getElementById("imgContainer");
//   imgContainer.src = URL.createObjectURL(event.target.files[0]);

//   performDetections();
// }

// const fileUpload = document.getElementById("fileUpload");
// fileUpload.addEventListener("change", handleUpload);
