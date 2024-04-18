(function(imageproc) {
    "use strict";

    /*
     * Apply sobel edge to the input data
     */
    imageproc.sobelEdge = function(inputData, outputData, threshold) {
        console.log("Applying Sobel edge detection...");

        /* Initialize the two edge kernel Gx and Gy */
        var Gx = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
        var Gy = [
            [-1,-2,-1],
            [ 0, 0, 0],
            [ 1, 2, 1]
        ];

        /**
         * TODO: You need to write the code to apply
         * the two edge kernels appropriately
         */
        
        for (var y = 0; y < inputData.height; y++) {
            for (var x = 0; x < inputData.width; x++) {
                var sum_pixelx = { r: 0, g: 0, b: 0 };
                var sum_pixely = { r: 0, g: 0, b: 0 };
                for (var j = -1; j <= 1; j++) {
                    for (var i = -1; i <= 1; i++) {
                        var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
                        sum_pixelx.r += kernel_pixel.r * Gx[j + 1][i + 1];
                        sum_pixelx.g += kernel_pixel.g * Gx[j + 1][i + 1];
                        sum_pixelx.b += kernel_pixel.b * Gx[j + 1][i + 1];
                        sum_pixely.r += kernel_pixel.r * Gy[j + 1][i + 1];
                        sum_pixely.g += kernel_pixel.g * Gy[j + 1][i + 1];
                        sum_pixely.b += kernel_pixel.b * Gy[j + 1][i + 1];
                    }
                }
                // console.log("sum_pixelx: ", sum_pixelx);
                // console.log("sum_pixely: ", sum_pixely);
                // console.log("G:", Math.hypot(sum_pixelx.r, sum_pixely.r));
                // console.log("E:", Math.abs(Math.hypot(sum_pixelx.r, sum_pixely.r)) > threshold ? 255 : 0);
                var i = (x + y * outputData.width) * 4;
                // outputData.data[i]     = inputData.data[i];
                // outputData.data[i + 1] = inputData.data[i + 1];
                // outputData.data[i + 2] = inputData.data[i + 2];

                outputData.data[i]     = Math.abs(Math.hypot(sum_pixelx.r, sum_pixely.r)) > threshold ? 255 : 0;
                outputData.data[i + 1] = Math.abs(Math.hypot(sum_pixelx.g, sum_pixely.g)) > threshold ? 255 : 0;
                outputData.data[i + 2] = Math.abs(Math.hypot(sum_pixelx.b, sum_pixely.b)) > threshold ? 255 : 0;
            }
        }
    } 

}(window.imageproc = window.imageproc || {}));
