// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
// const URL = "./model/";

// set button's onclick function
let btn = document.getElementById("Teachers");
btn.onclick = init;

let model, webcam, ctx, labelContainer, maxPredictions;

let counter = 0, initialized = false, notEngaged = 0;

async function init() {
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.className = "wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54";
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");

    // tells us that we have successfully loaded the model and is now ready for tracking the student
    initialized = true;
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    // Take the probability of the person not being engaged
    notEngaged = prediction[1].probability.toFixed(2);

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

//Interval that runs every second for teachers
setInterval(() => {
    if (initialized) {
        // if the person is not engaged
        if (notEngaged <= 0.25) {
            counter++;
        // if the person is engaged reset back to 0
        } else {
            counter = 0;
        }
        // once the person is not engaged for 10 seconds alert them
        if (counter === 180) {
            alert("You have been in a same pose for around 3 minutes, this might make the students bored of your class!");
            counter = 0;
        }
        }
}, 1000);