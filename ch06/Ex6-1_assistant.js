import { UI_Helper, Assistant_Script } from "./modules/assistant.js";
import {LocalReport} from "./modules/connection.js";

class Ex6_1 extends Assistant_Script {
  constructor() {
    super();
    this.ui = new UI_Helper("Exercise 6.1: Square Root");
    let report = new LocalReport();
    this.connections.push(report);

    this.ui.add_test(
      "Compilation",
      _ => {
        report.restart();
        return this.generic_compile_test()();
      } , 
      { fail_early: true }
    );
    
    this.ui.add_test(
      "Test 1 (question)",
      this.simple_equality_test(
        "0400 5337 2240 9166\n",
        "0020 0073 0047 0095\n",
        { compare_function: this.compare_sqrt }
      )
    );
    this.ui.add_test(
      "Test 2", 
      this.simple_equality_test(
        "0372 2195 4168 2915\n",
        "0019 0046 0064 0053\n",
        {compare_function: this.compare_sqrt}
      )
    );
    this.ui.add_test(
      "Test 3",
      this.simple_equality_test(
        "2302 8593 4248 0481\n",
        "0047 0092 0065 0021\n",
        {compare_function: this.compare_sqrt}
      )
    );
    this.ui.add_test(
      "Test 4",
      this.simple_equality_test(
        "1708 9816 8519 4815\n",
        "0041 0099 0092 0069\n",
        {compare_function: this.compare_sqrt}
      )
    );
    this.ui.add_test(
      "Test 5",
      this.simple_equality_test(
        "3359 0252 2294 4003\n",
        "0057 0015 0047 0063\n", 
        {compare_function: this.compare_sqrt}
      )
    );
    for (let i = 6; i <= 10; i++) {
      let random_test = this.generate_test();
      this.ui.add_test(
        `Test ${i}`,
        this.simple_equality_test(
          random_test[0],
          random_test[1],
          {compare_function: this.compare_sqrt}
          )
        );
    }

    this.ui.final_result = _ => {
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
        return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_1.report">(click here)</a>.`
      }
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  compare_sqrt(x, y) {
    x = x.trim().split(/\s+/);
    y = y.trim().split(/\s+/);
    if(x.length != 4) return false;
    for (let i = 0; i < 4; i++) {
      const error = Math.abs(x[i] - y[i]);
      if(isNaN(error) || error > 10) return false;
    }
    return true;
  }

  generate_test() {
    let input = "";
    let output = ""
    
    for (let i = 0; i < 4; i++ ){
        let val = this.randint(0, 1000);
        input += String(val).padStart(4, '0') + ' ';
        output += String(Math.round(Math.sqrt(val))).padStart(4, '0') + ' ';
    }
    return [input.slice(0, -1) + '\n', output.slice(0, -1) + '\n'];

  }
}

new Ex6_1();


