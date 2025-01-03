import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import serial_port from "./extensions/devices/serial_port.js"

class Ex7_2 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 7.2: Accessing Peripherals - Using Serial Port");
	
	  let report = new LocalReport();
    this.connections.push(report);
    let code_blob, lib_blob;
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
        "1\nRandom String\n",
        "Random String\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "2\nReversed String\n",
        "gnirtS desreveR\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "3\n1876\n",
        "754\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 4 (question)",
      this.simple_equality_test(
        "4\n244 + 67\n",
        "311\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    this.ui.add_test(
      "Test 5 (question)",
      this.simple_equality_test(
        "4\n2340 / 50\n",
        "46\n",
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    let repeat_string = ["RISC-V", "Architecture", "programming"]
    let rand_ind_1 = this.randint(0, 2) 
    this.ui.add_test(
      "Test 6",
      this.simple_equality_test(
        `1\n${repeat_string[rand_ind_1]}\n`,
        `${repeat_string[rand_ind_1]}\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    let base_string = ["Stack Pointer", "Assembly", "computer programming"]
    let reverse_string = ["retnioP kcatS", "ylbmessA", "gnimmargorp retupmoc"]
    let rand_ind_2 = this.randint(0, 2) 
    this.ui.add_test(
      "Test 7",
      this.simple_equality_test(
        `2\n${base_string[rand_ind_2]}\n`,
        `${reverse_string[rand_ind_2]}\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    let rand_int_1 = this.randint(-1000, 1000) 
    this.ui.add_test(
      "Test 8",
      this.simple_equality_test(
        `3\n${rand_int_1}\n`,
        `${this.hex_code(rand_int_1)}\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    let operators = ["+", "-", "*", "/"];
    let rand_op_1 = this.randint(-1000, 1000);
    let rand_op_2 = this.randint(-1000, 1000);
    let r_op_1 = this.randint(0, 3);
    this.ui.add_test(
      "Test 9",
      this.simple_equality_test(
        `4\n${rand_op_1} ${operators[r_op_1]} ${rand_op_2}\n`,
        `${this.expr_val(rand_op_1, rand_op_2, r_op_1)}\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );

    let rand_op_3 = this.randint(-1000, 1000);
    let rand_op_4 = this.randint(-1000, 1000);
    let r_op_2 = this.randint(0, 3);
    this.ui.add_test(
      "Test 10",
      this.simple_equality_test(
        `4\n${rand_op_3} ${operators[r_op_2]} ${rand_op_4}\n`,
        `${this.expr_val(rand_op_3, rand_op_4, r_op_2)}\n`,
        { compare_function: (a,b) => a.trim() == b.trim() }
      )
    );
    
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
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex7_2.report">(click here)</a>.`
    }
  }


  randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  expr_val(op1, op2, operator){
    var res = 0;
    switch (operator){
      case 0:
        res = op1 + op2;
        break;
      case 1:
        res = op1 - op2;
        break;
      case 2:
        res = op1 * op2;
        break;
      case 3:
        res = Math.trunc(op1 / op2);
        break;
    }
    return res;
  }

  hex_code(val){
    let uval = val>>>0;
    let hex = "";

    for (let i = 0; i < 8; i++){
      let aux = uval % 16;
      if (aux >= 10)
        hex = String.fromCharCode(aux - 10 + 'A'.charCodeAt(0)) + hex;
      else
        hex = String.fromCharCode(aux + '0'.charCodeAt(0)) + hex;
      uval = Math.trunc(uval / 16);
      if (uval == 0){
        break;
      }
    }
    return hex;
  };

  
}

new Ex7_2();
