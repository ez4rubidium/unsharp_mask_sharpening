(function(imageproc) {
    "use strict";

	imageproc.boxBlur = function(inputData, outputData, box_width, even_offset){
		var kernel = Array.from({length: box_width}, () => new Array(box_width).fill(1));
		console.log(kernel.length);
		var sliding_range = Math.floor(box_width / 2);
		for (var y = 0; y < inputData.height; y++) {
			for (var x = 0; x < inputData.width; x++) {
				var sum_pixel = { r: 0, g: 0, b: 0 };
				if(box_width % 2){
					for (var j = - sliding_range; j <= sliding_range; j++) {
						for (var i = - sliding_range; i <= sliding_range; i++) {
							var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
							// console.log("kernel_pixel: ", kernel_pixel);
							sum_pixel.r += kernel_pixel.r * kernel[j + sliding_range][i + sliding_range];
							sum_pixel.g += kernel_pixel.g * kernel[j + sliding_range][i + sliding_range];
							sum_pixel.b += kernel_pixel.b * kernel[j + sliding_range][i + sliding_range];
						}
					}
				}else{
					if(even_offset == -1)
						for (var j = - sliding_range; j <= sliding_range - 1; ++j) {
							for (var i = - sliding_range; i <= sliding_range - 1; ++i) {
								// console.log("kernel_pixel: ", kernel_pixel);
								var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
								// console.log("kernel[" + (j + sliding_range) + "][" + (i + sliding_range) + "]: " + kernel[j + sliding_range][i + sliding_range]);
								sum_pixel.r += kernel_pixel.r * kernel[j + sliding_range][i + sliding_range];
								sum_pixel.g += kernel_pixel.g * kernel[j + sliding_range][i + sliding_range];
								sum_pixel.b += kernel_pixel.b * kernel[j + sliding_range][i + sliding_range];
							}
						}
					else if(even_offset == 1){
						for (var j = - sliding_range; j <= sliding_range - 1; ++j) {
							for (var i = - sliding_range; i <= sliding_range - 1; ++i) {
								var kernel_pixel = imageproc.getPixel(inputData, x + i + 1, y + j);
								// console.log("kernel_pixel: ", kernel_pixel);
								// console.log("kernel[" + (j + sliding_range) + "][" + (i + sliding_range) + "]: " + kernel[j + sliding_range][i + sliding_range]);
								sum_pixel.r += kernel_pixel.r * kernel[j + sliding_range][i + sliding_range];
								sum_pixel.g += kernel_pixel.g * kernel[j + sliding_range][i + sliding_range];
								sum_pixel.b += kernel_pixel.b * kernel[j + sliding_range][i + sliding_range];
							}
						}
					}else{
						console.log("Error: even_offset mismatch.");
					}
				}
				var i = (x + y * outputData.width) * 4;
				outputData.data[i]     = sum_pixel.r / (kernel.length ** 2);
				outputData.data[i + 1] = sum_pixel.g / (kernel.length ** 2);
				outputData.data[i + 2] = sum_pixel.b / (kernel.length ** 2);
			}
		}
	}

	imageproc.medianBlur = function(inputData, outputData, radius){
		radius = Math.abs(radius) + 1.0;
		let matrix_length = 2 * Math.ceil(radius - 0.5) + 1;
		let sliding_range = Math.floor(matrix_length / 2);
		for (var y = 0; y < inputData.height; y++) {
			for (var x = 0; x < inputData.width; x++) {
				var kernel = {r: [], g: [], b: []};
				for(var j = -sliding_range; j <= sliding_range; ++j)
					for(var i = -sliding_range; i <= sliding_range; ++i){
						var kernel_pixel = imageproc.getPixel(inputData, x + i, y + j);
						kernel.r.push(kernel_pixel.r);
						kernel.g.push(kernel_pixel.g);
						kernel.b.push(kernel_pixel.b);
					}
				// console.log(kernel);
				let index = (x + y * outputData.width) * 4;
				outputData.data[index] = median(kernel.r);
				outputData.data[index + 1] = median(kernel.g);
				outputData.data[index + 2] = median(kernel.b);
			}
		}

		
	}

	imageproc.gaussianBlur = function(cmatrix, cmatrix_length, inputData, outputData, len){
		let cmatrix_middle = Math.floor(cmatrix_length / 2), row, i, j, count = 0, sum;
		for(let col = 0; col < inputData.height; ++col){
			if(cmatrix_length > len){
				for(row = 0; row < len; ++row){
					let scale = 0;
					for(j = 0; j < len; ++j){
						if(j + cmatrix_middle - row >= 0 && j + cmatrix_middle - row < cmatrix_length)
							scale += cmatrix[j];
					}
					// console.log("scale: " + scale);
					let k = col * len;
					sum = new Array(3).fill(0);

					let x = 0;
					for(i = 0; i < 3; ++i){
						for(j = 0; j < len; ++j){
							// let image_pixel = imageproc.getPixel(inputData, j, row);
							if(j + cmatrix_middle - row >= 0 && j + cmatrix_middle - row < cmatrix_length)
								sum[i] += inputData.data[(k + x) * 4 + i] * cmatrix[j];
							x++;
						}
						outputData.data[count * 4 + i] = Math.round(sum[i] / scale);
						
					}
					// console.log("outputData.data["+ count + "]: R " + outputData.data[count * 4] + " G " + outputData.data[count * 4 + 1] + " B " + + outputData.data[count * 4 + 2]);
					count++;
				}
			}
			else{

				for(row = 0; row < cmatrix_middle; ++row){
					let scale = 0;
					for(j = cmatrix_middle - row; j < cmatrix_length; ++j){
						// console.log("cmatrix[" + j +  "]: " + cmatrix[j]);	
						scale += cmatrix[j];
					}
					// console.log("scale: " + scale);

					let k = col * len;
					sum = new Array(3).fill(0);

					let x = 0;
					for(i = 0; i < 3; ++i){
						for(j = cmatrix_middle - row; j < cmatrix_length; ++j){
							// let image_pixel = imageproc.getPixel(inputData, j, row);
							sum[i] += inputData.data[(k + x) * 4 + i] * cmatrix[j];
							x++;
						}
						outputData.data[count * 4 + i] = Math.round(sum[i] / scale);
						
					}
					// console.log("outputData.data["+ count + "]: R " + outputData.data[count * 4] + " G " + outputData.data[count * 4 + 1] + " B " + + outputData.data[count * 4 + 2]);
					count++;
				}

				for(;row < len - cmatrix_middle; ++row){
					let k = col * len + row - cmatrix_middle;
					for(i = 0; i < 3; ++i){
						sum = new Array(3).fill(0);

						let x = 0;

						for(j = 0; j < cmatrix_length; j++){
							sum[i] += cmatrix[j] * inputData.data[(k + x)* 4 + i];
							x++;
						}
						outputData.data[count * 4 + i] = Math.round(sum[i]);
						
					}
					// console.log("outputData.data["+ count + "]: R " + outputData.data[count * 4] + " G " + outputData.data[count * 4 + 1] + " B " + + outputData.data[count * 4 + 2]);
					count++;
				}
		
				for(;row < len ; ++row){
		
					let scale = 0;
					for(j = 0; j < len - row + cmatrix_middle; ++j)
						scale += cmatrix[j];
		
					let k = col * len + row - cmatrix_middle;
		
					for(i = 0; i < 3; ++i){
		
						sum = new Array(3).fill(0);
		
						let x = 0;
		
						for(j = 0; j < len - row + cmatrix_middle; ++j){
							sum[i] += cmatrix[j] * inputData.data[(k + x)* 4 + i];
							x++;
						}
						outputData.data[count * 4 + i] = Math.round(sum[i]);
						
					}
					// console.log("outputData.data["+ count + "]: R " + outputData.data[count * 4] + " G " + outputData.data[count * 4 + 1] + " B " + + outputData.data[count * 4 + 2]);
					count++;
				}
			}
		}
	}

	imageproc.bilateralBlur = function(inputData, outputData, radius){
		// refering https://dl-acm-org.lib.ezproxy.hkust.edu.hk/doi/abs/10.1145/1141911.1141918
		
		// const N = Math.floor(Math.sqrt(radius)) * 2;
		// let hist = Array.from({length: 3}, () => new Int32Array(256).fill(0));
		// for(var row = 0; row <= 2 * radius; ++row){
		// 	for(var col = 0; col <= 2 * radius + N - 1; ++col){
		// 		let i = (row * inputData.width + col) * 4;
		// 		hist[0][inputData.data[i]]++;
		// 		hist[1][inputData.data[i + 1]]++;
		// 		hist[2][inputData.data[i + 2]]++;
		// 	}
		// }
	}

	imageproc.gen_convolve_matrix = function(radius){
		console.log("Generate convolutional matrix ...");
		let i, j, matrix_length, sum, std_dev, cmatrix;
		radius = Math.abs(radius) + 1.0;
		std_dev = radius;
		radius = std_dev * 2;
		
		// console.log("radius: " + radius + " std_dev: " + std_dev);

		matrix_length = 2 * Math.ceil(radius - 0.5) + 1;
		if(matrix_length <= 0)
			matrix_length = 1;	
		cmatrix = new Float32Array(matrix_length).fill(0.0);
		// console.log("matrix length: " + matrix_length + " c_matrix: " + cmatrix);

		for(i = Math.floor(matrix_length / 2) + 1; i < matrix_length; ++i){
			let base_x = i - (matrix_length / 2) - 0.5;
			sum = 0;
			for(j = 1; j <= 50; ++j){
				let r = base_x + 0.02 * j;
				if(r <= radius)
					sum += Math.exp(- Math.sqrt(r) / (2 * Math.sqrt(std_dev)));
			}
			cmatrix[i] = sum / 50;
			// console.log("cmatrix[" + i + "]: " + cmatrix[i]);
		}

		for(i = 0; i <= matrix_length / 2; ++i){
			cmatrix[i] = cmatrix[matrix_length - 1 - i];
			// console.log("cmatrix[" + i + "]: " + cmatrix[i]);
		}

		sum = 0;
		for(j = 0; j <= 50; ++j){
			sum += Math.exp(- Math.sqrt(0.5 + 0.02 * j) / (2 * Math.sqrt(std_dev)));
		}
		cmatrix[Math.floor(matrix_length / 2)] = sum / 51;
		// console.log("cmatrix[" + Math.floor(matrix_length / 2) + "]: " + cmatrix[Math.floor(matrix_length / 2)]);

		sum = 0;
		for (i = 0; i < matrix_length; ++i){
			// console.log("sum: " + sum);
			sum += cmatrix[i];
		}
		
		// console.log("sum: " + sum);

		for (i = 0; i < matrix_length; ++i){
			cmatrix[i] = cmatrix[i] / sum;
			
		}
		
		// console.log("cmatrix: " + cmatrix + "\ncmatrix_length: " + matrix_length);
		return [matrix_length, cmatrix];
	}

	imageproc.gen_convolve_matrix2D = function(radius){
		console.log("Generate convolutional 2D matrix ...");
		let i, j, matrix_length, matrix_middle, sum, std_dev, cmatrix;
		radius = Math.abs(radius) + 1.0;
		std_dev = radius;
		radius = std_dev * 2;
		
		// console.log("radius: " + radius + " std_dev: " + std_dev);

		matrix_length = 2 * Math.ceil(radius - 0.5) + 1;
		if(matrix_length <= 0)
			matrix_length = 1;
		matrix_middle = Math.floor(matrix_length / 2);
		cmatrix = Array.from({length: matrix_length}, () => new Float32Array(matrix_length).fill(0.0));
		// console.log("matrix length: " + matrix_length + " c_matrix: " + cmatrix);

		for(i = matrix_middle + 1; i < matrix_length; ++i){
			let base_x = i - (matrix_length / 2) - 0.5;
			sum = 0;
			for(j = 1; j <= 50; ++j){
				let r = base_x + 0.02 * j;
				if(r <= radius)
					sum += Math.exp(- Math.sqrt(r) / (2 * Math.sqrt(std_dev)));
			}
			cmatrix[matrix_middle + 1][i] = sum / 50;
			cmatrix[i][matrix_middle + 1] = sum / 50;

			// console.log("cmatrix[" + i + "]: " + cmatrix[i]);
		}

		for(i = 0; i <= matrix_middle; ++i){
			cmatrix[matrix_middle + 1][i] = cmatrix[matrix_length - 1 - i];
			cmatrix[i][matrix_middle + 1] = cmatrix[matrix_length - 1 - i];
			// console.log("cmatrix[" + i + "]: " + cmatrix[i]);
		}

		sum = 0;
		for(j = 0; j <= 50; ++j){
			sum += Math.exp(- Math.sqrt(0.5 + 0.02 * j) / (2 * Math.sqrt(std_dev)));
		}
		cmatrix[matrix_middle] = sum / 51;
		// console.log("cmatrix[" + Math.floor(matrix_length / 2) + "]: " + cmatrix[Math.floor(matrix_length / 2)]);

		sum = 0;
		for (i = 0; i < matrix_length; ++i){
			// console.log("sum: " + sum);
			sum += cmatrix[i];
		}
		
		// console.log("sum: " + sum);

		for (i = 0; i < matrix_length; ++i){
			cmatrix[i] = cmatrix[i] / sum;
			
		}
		
		// console.log("cmatrix: " + cmatrix + "\ncmatrix_length: " + matrix_length);
		return [matrix_length, cmatrix];
	}


    /*
     * Apply unsharp mask to the input data
     */
    imageproc.unsharpMask = function(inputData, outputData, type, amount, radius, threshold) {
        console.log("Applying unsharp mask...");
		var mergeBuffer = imageproc.createBuffer(inputData), unsharpBuffer = imageproc.createBuffer(inputData);
		imageproc.copyImageData(inputData, mergeBuffer);

		switch(type){
			case "box":
				const box_width = Math.round(radius * 3 * Math.sqrt(2 * Math.PI) / 4);
				if(box_width < 1){
					imageproc.copyImageData(inputData, unsharpBuffer);
					break;
				}
				if(box_width % 2){
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
					imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 0);
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
				}else{
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, -1);
					imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 1);
					imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width + 1, 0);
				}
				break;
			case "gaussian":
				if (radius < 10){
					const [cmatrix_length, cmatrix] = imageproc.gen_convolve_matrix(radius);
					// console.log("cmatrix: " + cmatrix + "\ncmatrix_length: " + cmatrix_length);
					imageproc.gaussianBlur(cmatrix, cmatrix_length, inputData, unsharpBuffer, inputData.width);

				}else{
					const box_width = Math.round(radius * 3 * Math.sqrt(2 * Math.PI) / 4);
					if(box_width < 1){
						imageproc.copyImageData(inputData, unsharpBuffer);
						break;
					}
					if(box_width % 2){
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
						imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 0);
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, 0);
					}else{
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width, -1);
						imageproc.boxBlur(unsharpBuffer, mergeBuffer, box_width, 1);
						imageproc.boxBlur(mergeBuffer, unsharpBuffer, box_width + 1, 0);
					}
				}
				break;
			case "median":
				imageproc.medianBlur(inputData, unsharpBuffer, radius);

				break;
			case "bilateral":
				break;
			default:
		}

		for (var y = 0; y < inputData.height; y++) {
			for (var x = 0; x < inputData.width; x++) {		
				var i = (x + y * outputData.width) * 4;

				outputData.data[i] = unsharpBuffer.data[i];
				outputData.data[i + 1] = unsharpBuffer.data[i + 1];
				outputData.data[i + 2] = unsharpBuffer.data[i + 2];

				// var org_hsv = imageproc.fromRGBToHSV(inputData.data[i], inputData.data[i + 1], inputData.data[i + 2]);
				// var unsharp_hsv = imageproc.fromRGBToHSV(unsharpBuffer.data[i], unsharpBuffer.data[i + 1], unsharpBuffer.data[i + 2]);
				// let diff = (org_hsv.v - unsharp_hsv.v);
				// if(Math.abs(2 * diff) < threshold)
				// 	diff = 0;
				// let value = org_hsv.v + amount * diff;
				// let new_v = Math.max(0, Math.min(parseInt(value), 1));
				// let new_rgb = imageproc.fromHSVToRGB(org_hsv.h, org_hsv.s, new_v);
				// outputData.data[i] = new_rgb.r;
				// outputData.data[i + 1] = new_rgb.g;
				// outputData.data[i + 2] = new_rgb.b;

				// for(var color = 0; color < 3; ++color){
				// 	let diff = (inputData.data[i + color] - unsharpBuffer.data[i + color]);
				// 	if(Math.abs(2 * diff) < threshold * 64)
				// 		diff = 0;
				// 	let new_color = Math.max(0, Math.min(parseInt(inputData.data[i + color] + amount * diff), 255));
				// 	outputData.data[i + color] = new_color;
				// }
			}
		}
    }
 
}(window.imageproc = window.imageproc || {}));



function median(values){
	if (!values.length) {
	  return NaN;
	}
	// Sorting values, preventing original array
	// from being mutated.
	values = values.slice().sort((a, b) => a - b);
  
	const half = Math.floor(values.length / 2);
  
	return (values.length % 2
	  ? values[half]
	  : (values[half - 1] + values[half]) / 2
	);
  
  }
