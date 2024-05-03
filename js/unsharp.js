(function(imageproc) {
    "use strict";

    /*
     * Apply unsharp mask to the input data
     */
    imageproc.unsharpMask = function(inputData, outputData, type, amount, radius, threshold) {
        console.log("Applying unsharp mask...");

        var blurred = inputData;
        blurred = imageproc.createBuffer(outputData)

        // Apply the blur effect to the input data
        imageproc.blur(inputData, blurred, radius);

        for (var i = 0; i < inputData.data.length; i += 4) {
            // First, you convert the colour to HSL
            var r_in = inputData.data[i];
            var g_in = inputData.data[i + 1];
            var b_in = inputData.data[i + 2];
            var hsv_in = imageproc.fromRGBToHSV(r_in, g_in, b_in);
            var r_br = blurred.data[i];
            var g_br = blurred.data[i + 1];
            var b_br = blurred.data[i + 2];
            var hsv_br = imageproc.fromRGBToHSV(r_br, g_br, b_br);

            // Calculate the difference between the blurred image and the original image
            // var diffR = inputData.data[i] - blurred.data[i];
            // var diffG = inputData.data[i + 1] - blurred.data[i + 1];
            // var diffB = inputData.data[i + 2] - blurred.data[i + 2];

            var diffH = hsv_in.h - hsv_br.h;
            var diffS = hsv_in.s - hsv_br.s;
            var diffV = hsv_in.v - hsv_br.v;

            // Create a new ImageData object to store the difference
            // outputData.data[i]     = diffR;
            // outputData.data[i + 1] = diffG;
            // outputData.data[i + 2] = diffB;
            // outputData.data[i + 3] = 255; // Alpha value
            
            // Apply the difference to the original image
            // outputData.data[i]     = inputData.data[i] + amount * diffR;
            // outputData.data[i + 1] = inputData.data[i + 1] + amount * diffG;
            // outputData.data[i + 2] = inputData.data[i + 2] + amount * diffB;

            // diffV = (diffV > threshold) ? diffV : 0;
            // diffV = (diffV < -1 * threshold) ? diffV : 0;
            console.log("diffV: ", diffV);
            // diffV = (diffV < 0) ? 0 : diffV;
            var outV = (hsv_in.v + amount * diffV > 1) ? 1 : hsv_in.v + amount * diffV;
            var rgb = imageproc.fromHSVToRGB(hsv_in.h, hsv_in.s, outV);
            outputData.data[i]     = rgb.r;
            outputData.data[i + 1] = rgb.g;
            outputData.data[i + 2] = rgb.b;
        }

        // Return the output data
    }
 
}(window.imageproc = window.imageproc || {}));
