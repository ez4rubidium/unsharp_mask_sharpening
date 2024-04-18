(function (imageproc) {
    "use strict";

    /*
     * Apply ordered dithering to the input data
     */
    imageproc.dither = function (inputData, outputData, matrixType) {
        console.log("Applying dithering...");

        /*
         * TODO: You need to extend the dithering processing technique
         * to include multiple matrix types
         */
        switch (matrixType) {
            case "bayer2":
                // At the moment, the code works only for the Bayer's 2x2 matrix
                // You need to include other matrix types

                // Set up the matrix
                var matrix = [[1, 3], [4, 2]];
                var levels = 5;

                // The following code uses Bayer's 2x2 matrix to create the
                // dithering effect. You need to extend it to work for different
                // matrix types

                for (var y = 0; y < inputData.height; y++) {
                    for (var x = 0; x < inputData.width; x++) {
                        var pixel = imageproc.getPixel(inputData, x, y);

                        // Change the colour to grayscale and normalize it
                        var value = (pixel.r + pixel.g + pixel.b) / 3;
                        value = value / 255 * levels;

                        // Get the corresponding threshold of the pixel
                        var threshold = matrix[y % 2][x % 2];

                        // Set the colour to black or white based on threshold
                        var i = (x + y * outputData.width) * 4;
                        outputData.data[i] =
                            outputData.data[i + 1] =
                            outputData.data[i + 2] = (value < threshold) ? 0 : 255;
                    }
                }
                break;

            case "bayer4":
                // Set up the matrix
                var matrix = [
                    [1, 9, 3, 11],
                    [13, 5, 15, 7],
                    [4, 12, 2, 10],
                    [16, 8, 14, 6]];
                var levels = 17;

                for (var y = 0; y < inputData.height; y++) {
                    for (var x = 0; x < inputData.width; x++) {
                        var pixel = imageproc.getPixel(inputData, x, y);
                        // Change the colour to grayscale and normalize it
                        var value = (pixel.r + pixel.g + pixel.b) / 3;
                        value = value / 255 * levels;

                        // console.log("matrix.length",matrix.length)
                        // Get the corresponding threshold of the pixel
                        var threshold = matrix[y % matrix.length][x % matrix.length];

                        // Set the colour to black or white based on threshold
                        var i = (x + y * outputData.width) * 4;
                        outputData.data[i] =
                            outputData.data[i + 1] =
                            outputData.data[i + 2] = (value < threshold) ? 0 : 255;
                    }
                }
                break;

            case "line":
                // Set up the matrix
                var matrix = [
                    [15, 25, 15, 15],
                    [25, 15, 15, 15],
                    [15, 15, 15, 25],
                    [15, 15, 25, 15]];
                var levels = 100;

                for (var y = 0; y < inputData.height; y++) {
                    for (var x = 0; x < inputData.width; x++) {
                        var pixel = imageproc.getPixel(inputData, x, y);
                        // Change the colour to grayscale and normalize it
                        var value = (pixel.r + pixel.g + pixel.b) / 3;
                        value = value / 255 * levels;

                        // Get the corresponding threshold of the pixel
                        var threshold = matrix[y % matrix.length][x % matrix.length];

                        // Set the colour to black or white based on threshold
                        var i = (x + y * outputData.width) * 4;
                        outputData.data[i] =
                            outputData.data[i + 1] =
                            outputData.data[i + 2] = (value < threshold) ? 0 : 255;
                    }
                }
                break;

            case "diamond":
                // Set up the matrix
                var matrix = [
                    [15, 15, 25, 15],
                    [15, 25, 15, 25],
                    [25, 15, 15, 15],
                    [15, 25, 15, 25],
                ];
                var levels = 100;

                for (var y = 0; y < inputData.height; y++) {
                    for (var x = 0; x < inputData.width; x++) {
                        var pixel = imageproc.getPixel(inputData, x, y);
                        // Change the colour to grayscale and normalize it
                        var value = (pixel.r + pixel.g + pixel.b) / 3;
                        value = value / 255 * levels;

                        // Get the corresponding threshold of the pixel
                        var threshold = matrix[y % matrix.length][x % matrix.length];

                        // Set the colour to black or white based on threshold
                        var i = (x + y * outputData.width) * 4;
                        outputData.data[i] =
                            outputData.data[i + 1] =
                            outputData.data[i + 2] = (value < threshold) ? 0 : 255;
                    }
                }
                break;
        }
    }
}(window.imageproc = window.imageproc || {}));
