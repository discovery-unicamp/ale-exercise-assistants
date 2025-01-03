import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";
import canvas from "./extensions/devices/canvas.js"

class Ex6_5 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 6.5: Applying a Filter to an Image");

    let img_test = async _ => {
      let img = this.generate_lines();
      simulator_controller.load_new_file(img[0]);
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        return false;
      }
      await await this.wait_for_output({msg:"User stop", fh: 2, timeout:30000});
      const result = canvas.imageData.data;
      this.stop_simulator();
      this.log_output();
      if(canvas.imageData.data.length != img[1]*4){
        this.ui.log(`Incorrect Size: ${img[1]*4} != ${canvas.imageData.data.length}`);
        this.log(`Incorrect Size: ${img[1]*4} != ${canvas.imageData.data.length}`);
        return false;
      }
      for (let i = 0; i < img[1]; i++) {
        if(result[i*4] != img[2][i]){
          this.ui.log(`Incorrect Pixel: ${i} (${result[i*4]} != ${img[2][i]})`);
          this.log(`Incorrect Pixel: ${i} (${result[i*4]} != ${img[2][i]})`);
          return false;
        }
      }
      return true
    }
    
 
    let report = new LocalReport();
    this.connections.push(report);
    this.predefined_args = ["--newlib", "--setreg", "sp=0x7FFFFFC", "--isa", "acdfimsu"];
    this.ui.add_test(
      "Compilation",
      _ => {
        report.restart();
        return this.generic_compile_test()();
      } , 
      { fail_early: true }
    );
    this.ui.add_test("Test 1", img_test);
    this.ui.add_test("Test 2", img_test);
    this.ui.add_test("Test 3", img_test);
    this.ui.add_test("Test 4", img_test);
    this.ui.add_test("Test 5", img_test);

    this.ui.final_result = _ =>{
      report.report["test_results"] = this.ui.test_results;
      let grade = 0;
      if (this.ui.test_results[0] != 0) {
        let n_tests = this.ui.test_results.length
        for (let i = 1; i < n_tests; i++) {
          grade += this.ui.test_results[i];
        }
        grade = (grade * 10) / (n_tests-1);
      }
      report.report["final_grade"] = grade;

      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});

      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_5.report">(click here)</a>.`
    }
  }

  generate_lines(){
    // header
    let x = 10
    let y = 10
    let header_str = `P5\n${x} ${y}\n255\n`
    let header = new TextEncoder("utf-8").encode(header_str);
    let data = new Uint8Array(x*y);
    const bg_color = this.randint(0,255);
    for (let i = 0; i < data.length; i++) {
      data[i] = bg_color;
    }
    let n_lines = this.randint(10, 200);
    for (let i = 0; i < n_lines; i++) {
      const x_ini = this.randint(0, x);    
      const y_ini = this.randint(0, y); 
      const x_dir = this.randint(-1,1);   
      const y_dir = this.randint(-1,1);   
      const size = this.randint(0, y);   
      const color = this.randint(0, 255); 
      for (let j = 0; j < size; j++) {
        const idx = (x_ini + j*x_dir) * x + (y_ini + j*y_dir);
        if(idx < 0 || idx >= data.length) break;
        data[idx] = color;
      }
    }
    let blob = new Blob([header, data], {type: "application/octet-stream"});
    let file = new File([blob], "image.pgm");
    return [file, x*y, this.apply_kernel(data, x, y, [-1, -1, -1, -1,  8, -1, -1, -1, -1])];
  }

  randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  apply_kernel(d1, w, h, k) {
    var d2 = new Uint8Array(w*h);
    // border
    for (let i = 0; i < h; i++) {
      d2[i*w] = 0;
      d2[i*w + w - 1] = 0;
    }
    for (let i = 0; i < w; i++) {
      d2[i] = 0;
      d2[i + (h - 1)*w] = 0;
    }
    // function from Image Kernels explained visually (https://setosa.io/ev/image-kernels/)
    var idx, i, j
    for(i = 1; i < h - 1; i++) {
      for(j = 1; j < w - 1; j++) {
        idx = i * w + j
        // WARNING: Optimized code.
        let val = (
            d1[(i - 1) * w + (j - 1)] * k[0]
          + d1[(i - 1) * w + (j    )] * k[1]
          + d1[(i - 1) * w + (j + 1)] * k[2]
          + d1[(i    ) * w + (j - 1)] * k[3]
          + d1[(i    ) * w + (j    )] * k[4]
          + d1[(i    ) * w + (j + 1)] * k[5]
          + d1[(i + 1) * w + (j - 1)] * k[6]
          + d1[(i + 1) * w + (j    )] * k[7]
          + d1[(i + 1) * w + (j + 1)] * k[8]
        ) | 0;
        d2[idx] = val > 255 ? 255 : val < 0? 0 : val;
      }
    }
    return d2;
  }

}

new Ex6_5();
  
  