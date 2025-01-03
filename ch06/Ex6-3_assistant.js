// Example of assistant script
import { UI_Helper, Assistant_Script } from "./modules/assistant.js";
import {LocalReport} from "./modules/connection.js";

class Ex6_3 extends Assistant_Script {
  constructor() {
    super();
    this.ui = new UI_Helper("Exercise 6.3: Hamming Code");
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
        "1001\n0011001\n",
        "0011001\n1001\n0\n",
        { compare_function: (a,b) => this.custom_compare(a, b) }
      )
    );
    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "0000\n0000000\n",
        "0000000\n0000\n0\n",
        { compare_function: (a,b) => this.custom_compare(a, b) }
      )
    );
    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "0001\n0010001\n",
        "1101001\n1001\n1\n",
        { compare_function: (a,b) => this.custom_compare(a, b) }
      )
    );
    this.ui.add_test(
      "Test 4 (question)",
      this.simple_equality_test(
        "1111\n1001001\n",
        "1111111\n0001\n1\n",
        { compare_function: (a,b) => this.custom_compare(a, b) }
      )
    );
    this.ui.add_test(
      "Test 5 (question)",
      this.simple_equality_test(
        "1010\n1011010\n",
        "1011010\n1010\n0\n",
        { compare_function: (a,b) => this.custom_compare(a, b) }
      )
    );
    for (let i = 6; i <= 10; i++) {
      let random_test = this.generate_test();
      this.ui.add_test(
        `Test ${i}`,
        this.simple_equality_test(
          random_test[0],
          random_test[1],
          {compare_function: (a,b) => this.custom_compare(a, b) }
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
        return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_3.report">(click here)</a>.`
      }
  }

  custom_compare(a, b){
    let expected = a.split('\n').filter((item => item != ""));
    let result = b.split('\n').filter((item => item != ""));
    return expected.join('\n') == result.join('\n');
  };

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  int_to_bin(val, bits){
    return (val >>> 0).toString(2).padStart(bits, '0').slice(-bits);
  }

  encode_hamming(data){
    let p1, p2, p3;
    p1 = ((data[0] - '0') ^ (data[1] - '0') ^ (data[3] - '0'));
    p2 = ((data[0] - '0') ^ (data[2] - '0') ^ (data[3] - '0'));
    p3 = ((data[1] - '0') ^ (data[2] - '0') ^ (data[3] - '0'));
    return `${p1}${p2}${data[0]}${p3}${data[1]}${data[2]}${data[3]}`;
  }

  get_data(code){
    return `${code[2]}${code[4]}${code[5]}${code[6]}`
  }

  check_hamming(code){
    let c1, c2, c3;
    c1 = (code[0] - '0') ^ (code[2] - '0') ^ (code[4] - '0') ^ (code[6] - '0');
    c2 = (code[1] - '0') ^ (code[2] - '0') ^ (code[5] - '0') ^ (code[6] - '0');
    c3 = (code[3] - '0') ^ (code[4] - '0') ^ (code[5] - '0') ^ (code[6] - '0');
    if (c1 || c2 || c3){
      return '1';
    }
    return '0';
  }

  setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

  generate_test() {
    let l1, l2, flip;
    l1 = this.int_to_bin(this.randint(0, 16), 4);
    l2 = this.int_to_bin(this.randint(0, 16), 4);
    flip = this.randint(0, 2);
    l2 = this.encode_hamming(l2);
    if (flip == 1){
      let flipped_bit = this.randint(0, 7);
      if (l2[flipped_bit] == '1'){
        l2 = this.setCharAt(l2, flipped_bit, '0');
      } else {
        l2 = this.setCharAt(l2, flipped_bit, '1');
      }
    }
    let input = `${l1}\n${l2}\n`;
    let output = `${this.encode_hamming(l1)}\n${this.get_data(l2)}\n${flip}\n`;
    return [input, output];
  }
}

new Ex6_3();


