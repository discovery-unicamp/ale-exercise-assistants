import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";
import canvas from "./extensions/devices/canvas.js"

class Ex6_4 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 6.4: Image on Canvas");

    let img_test = async _ => {
      let img = this.generate_rnd_image();
      simulator_controller.load_new_file(img[0]);
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        return false;
      }
      await await this.wait_for_output({msg:"User stop", fh: 2, timeout:30000});
      const result = canvas.imageData.data;
      if(canvas.imageData.data.length != img[1]*4){
        this.ui.log(`Incorrect Size: ${img[1]} != ${canvas.imageData.data.length}`);
        this.log(`Incorrect Size: ${img[1]} != ${canvas.imageData.data.length}`);
        return false;
      }
      this.stop_simulator();
      this.log_output();
      for (let i = 0; i < img[1]; i++) {
        if(result[i*4] != img[2][i]){
          this.ui.log(`Incorrect Pixel: ${i}`);
          this.log(`Incorrect Pixel: ${i}`);
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
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_4.report">(click here)</a>.`
    }
  }

  generate_rnd_image(){
    // header
    let x = this.randint(10, 20)
    let y = this.randint(10, 20)
    let header_str = `P5\n${x} ${y}\n255\n`
    let header = new TextEncoder("utf-8").encode(header_str);
    let data = new Uint8Array(x*y);
    for (let i = 0; i < data.length; i++) {
      data[i] = this.randint(0,255);
    }
    let blob = new Blob([header, data], {type: "application/octet-stream"});
    let file = new File([blob], "image.pgm");
    return [file, x*y, data];
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}

new Ex6_4();