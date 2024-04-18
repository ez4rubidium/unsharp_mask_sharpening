(function(imageproc) {
    "use strict";

    /*
     * Apply unsharp mask to the input data
     */
    imageproc.unsharpMask = function(inputData, outputData, type, amount, radius, threshold) {
        console.log("Applying unsharp mask...");

        for (var i = 0; i < inputData.data.length; i += 4) {
            outputData.data[i]     = 255 - inputData.data[i];
            outputData.data[i + 1] = 255 - inputData.data[i + 1];
            outputData.data[i + 2] = 255 - inputData.data[i + 2];
        }
    }
 
}(window.imageproc = window.imageproc || {}));
