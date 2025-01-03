import { UI_Helper, Assistant_Script } from "./modules/assistant.js";
import {LocalReport} from "./modules/connection.js";

class Ex5_1 extends Assistant_Script {
  constructor() {
    super();
    this.ui = new UI_Helper("Exercise 5.1: Bit Masking and Shift Operations");
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
        "-0001 -0001 -0001 -0001 -0001\n",
        "0xFFFFFFFF\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "+0001 +0001 -0001 -0001 -0001\n",
        "0xFFFFF809\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "+0003 -0002 +0025 +0030 +1000\n",
        "0x7D1ECFF3\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    this.ui.add_test(
      "Test 4 (question)",
      this.simple_equality_test(
        "+9999 +9999 +9999 +9999 +9999\n",
        "0xE1EF787F\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    for (let i = 5; i <= 10; i++) {
      let random_test = this.generate_test();
      this.ui.add_test(
        `Test ${i}`,
        this.simple_equality_test(
          random_test[0],
          random_test[1],
          {compare_function: (a,b) => a.trim() == b.trim()}
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
        return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex5_1.report">(click here)</a>.`
      }
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  hex_code(val){
    let uval = val>>>0;
    let hex = "\n";

    for (let i = 0; i < 8; i++){
      let aux = uval % 16;
      if (aux >= 10)
        hex = String.fromCharCode(aux - 10 + 'A'.charCodeAt(0)) + hex;
      else
        hex = String.fromCharCode(aux + '0'.charCodeAt(0)) + hex;
      uval = uval / 16;
    }
    return "0x" + hex;
  }

  pack(input, start_bit, end_bit, val){
    let mask = 0, power = 1;
    for (let i = 0; i < (end_bit - start_bit) + 1; i++ ){
        mask += power;
        power *= 2;
    }
    input &= mask;
    mask = mask << start_bit;
    input = input << start_bit;
    val &= (~mask);
    val |= input;
    return val;
  }

  generate_test() {
    let values = [];
    let answer = 0;
    let input = "";
    let bits = [
        [0, 2],
        [3, 10],
        [11, 15],
        [16, 20],
        [21, 31]
    ]
    for (let i = 0; i < 5; i++ ){
        let neg = this.randint(0, 2);
        let val = this.randint(0, 1000);
        if (neg == 1)
            val = -val;
        values.push(val);
    }
    for (let i = 0; i < 5; i++ ){
        if (values[i] >= 0){
            input += '+' + String(values[i]).padStart(4, '0') + ' ';
        } else {
            input += '-' + String(-values[i]).padStart(4, '0') + ' ';
        }
        answer = this.pack(values[i], bits[i][0], bits[i][1], answer);
    }

    return [input.slice(0, -1) + '\n', this.hex_code(answer)];

  }
}

new Ex5_1();


