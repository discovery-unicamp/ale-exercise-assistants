import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E2_2 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.2.2: Data Organization on the Memory");
    
    let v_int = this.randint(1, 5000);
    let size_int = this.randint(100, 125);

    let v_short = this.randint(1, 5000);
    let size_short = this.randint(100, 125);

    let v_char = this.randint(1, 127);
    let size_char = this.randint(100, 125);

    let v_matrix = this.randint(1, 5000);
    let matrix_r = this.randint(1, 11);
    let matrix_c = this.randint(0, 41);

    let code_int = this.get_blob("int", v_int, size_int);
    let code_short = this.get_blob("short", v_short, size_short);
    let code_char = this.get_blob("char", v_char, size_char);
    let code_mat = this.get_blob_matrix(v_matrix, matrix_r, matrix_c);

    let int_test = async _ => {
        this.add_code(code_int, "linked_code.s");
        this.default_filename = await this.compile_code();
        this.log_output();
        this.log_input_files();
        if(!this.default_filename){
          this.ui.log("Compilation Error.\nDid you upload the wrong file or forget to declare a label as global?");
          return false;
        }
          

        this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
        if(!(await this.run_simulator())){
          this.ui.log("No file selected");
          this.log("No file selected");
          return false;
        }

        let symbols = await this.get_symbols();
        await this.run_interactive_cmd(`until 0x${symbols["__after_check"].toString(16)}`);
        let arrived_at_symbol = ((parseInt(await this.run_interactive_cmd("peek pc"))) == symbols["__after_check"]);
        if (!arrived_at_symbol){
          this.stop_simulator();
          this.ui.log("Program execution flow is incorrect!\nDid you remeber to save 'ra' and restore it in your function before returning?");
          return false;
        }

        let t1 = (parseInt(await this.run_interactive_cmd("peek r t1")));
        let t2 = (parseInt(await this.run_interactive_cmd("peek r t2")));

        let ind = t1*2 + t2;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          "Did not return the middle value of the array of ints",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };

    let short_test = async _ => {
        this.add_code(code_short, "linked_code.s");
        this.default_filename = await this.compile_code(); 
        this.log_output();
        this.log_input_files();
        if(!this.default_filename){
          this.ui.log("Compilation Error.\nDid you upload the wrong file or forget to declare a label as global?");
          return false;
        }

        this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
        if(!(await this.run_simulator())){
          this.ui.log("No file selected");
          this.log("No file selected");
          return false;
        }

        let symbols = await this.get_symbols();
        await this.run_interactive_cmd(`until 0x${symbols["__after_check"].toString(16)}`);
        let arrived_at_symbol = ((parseInt(await this.run_interactive_cmd("peek pc"))) == symbols["__after_check"]);
        if (!arrived_at_symbol){
          this.stop_simulator();
          this.ui.log("Program execution flow is incorrect!\nDid you remeber to save 'ra' and restore it in your function before returning?");
          return false;
        }

        let t1 = (parseInt(await this.run_interactive_cmd("peek r t1")));
        let t2 = (parseInt(await this.run_interactive_cmd("peek r t2")));

        let ind = t1*2 + t2;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          "Did not return the middle value of the array of shorts",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };

    let char_test = async _ => {
        this.add_code(code_char, "linked_code.s");
        this.default_filename = await this.compile_code(); 
        this.log_output();
        this.log_input_files();
        if(!this.default_filename){
          this.ui.log("Compilation Error.\nDid you upload the wrong file or forget to declare a label as global?");
          return false;
        }

        this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
        if(!(await this.run_simulator())){
          this.ui.log("No file selected");
          this.log("No file selected");
          return false;
        }

        let symbols = await this.get_symbols();
        await this.run_interactive_cmd(`until 0x${symbols["__after_check"].toString(16)}`);
        let arrived_at_symbol = ((parseInt(await this.run_interactive_cmd("peek pc"))) == symbols["__after_check"]);
        if (!arrived_at_symbol){
          this.stop_simulator();
          this.ui.log("Program execution flow is incorrect!\nDid you remeber to save 'ra' and restore it in your function before returning?");
          return false;
        }

        let t1 = (parseInt(await this.run_interactive_cmd("peek r t1")));
        let t2 = (parseInt(await this.run_interactive_cmd("peek r t2")));

        let ind = t1*2 + t2;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          "Did not return the middle value of the array of chars",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };

    let matrix_test = async _ => {
        this.add_code(code_mat, "linked_code.s");
        this.default_filename = await this.compile_code(); 
        this.log_output();
        this.log_input_files();
        if(!this.default_filename){
          this.ui.log("Compilation Error.\nDid you upload the wrong file or forget to declare a label as global?");
          return false;
        }

        this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
        if(!(await this.run_simulator())){
          this.ui.log("No file selected");
          this.log("No file selected");
          return false;
        }

        let symbols = await this.get_symbols();
        await this.run_interactive_cmd(`until 0x${symbols["__after_check"].toString(16)}`);
        let arrived_at_symbol = ((parseInt(await this.run_interactive_cmd("peek pc"))) == symbols["__after_check"]);
        if (!arrived_at_symbol){
          this.stop_simulator();
          this.ui.log("Program execution flow is incorrect!\nDid you remeber to save 'ra' and restore it in your function before returning?");
          return false;
        }
        
        let t1 = (parseInt(await this.run_interactive_cmd("peek r t1")));
        let t2 = (parseInt(await this.run_interactive_cmd("peek r t2")));

        let ind = t1*2 + t2;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          "Did not return the correct value of the matrix of ints",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };

    this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
    this.ui.add_test("Test middle_value_int", int_test);
    this.ui.add_test("Test middle_value_short", short_test);
    this.ui.add_test("Test middle_value_char", char_test);
    this.ui.add_test("Test value_matrix", matrix_test);
  
  
    this.ui.final_result = _ => {
      let grade = 0;
      let n_tests = this.ui.test_results.length
      for (let i = 0; i < n_tests; i++) {
        grade += this.ui.test_results[i];
      }
      grade = (grade * 10) / (n_tests);
      
      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});

      return `Grade: ${grade.toFixed(1)}.<br>Download testing code that was linked to your program (<a href=${window.URL.createObjectURL(code_int)} download="linked_code_int.s">int</a>, <a href=${window.URL.createObjectURL(code_short)} download="linked_code_short.s">short</a>, <a href=${window.URL.createObjectURL(code_char)} download="linked_code_char.s">char</a>, <a href=${window.URL.createObjectURL(code_mat)} download="linked_code_mat.s">matrix</a>).`
    }
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  get_blob(type, value, size){
    let type_specs = { // tuple (load/store type, size)
      "int": ["w", 4],
      "short": ["h", 2],
      "char": ["b", 1],
    };
    let specs = type_specs[type];
    let code = `# Testing Code for Exercise 8.2.2 (${type})
    .globl _start
    _start:
       li s0, 0xABCDEFAB
       li s1, 0xABCDEFAB
       li s2, 0xABCDEFAB
       li s3, 0xABCDEFAB
       li s4, 0xABCDEFAB
       li s5, 0xABCDEFAB
       li s6, 0xABCDEFAB
       li s7, 0xABCDEFAB
       li s8, 0xABCDEFAB
       li s9, 0xABCDEFAB
       li s10, 0xABCDEFAB
       li s11, 0xABCDEFAB
       li sp, 0x7FFFFFC
       addi sp, sp, -${16*size}
       li t0, ${value}
       s${specs[0]} t0, ${Math.floor(size/2)*specs[1]}(sp)
       li t0, 0
       mv a0, sp
       li a1, ${size}
       jal middle_value_${type}
       addi sp, sp, ${16*size}
       li t0, 0xABCDEFAB
       bne s0, t0, __test_fail_callee_save
       bne s1, t0, __test_fail_callee_save
       bne s2, t0, __test_fail_callee_save
       bne s3, t0, __test_fail_callee_save
       bne s4, t0, __test_fail_callee_save
       bne s5, t0, __test_fail_callee_save
       bne s7, t0, __test_fail_callee_save
       bne s8, t0, __test_fail_callee_save
       bne s9, t0, __test_fail_callee_save
       bne s10, t0, __test_fail_callee_save
       bne s11, t0, __test_fail_callee_save
       li t0, 0x7FFFFFC
       bne sp, t0, __test_fail_callee_save
       li t0, ${value}
       bne t0, a0, __test_wrong_value
       li t1, 0
       li t2, 0
       j __after_check
    __test_fail_callee_save:
       li t1, 0
       li t2, 1
       j __after_check
    __test_wrong_value:
       li t1, 1
       li t2, 0
       j __after_check
    __after_check:
      li a0, 0
      li a7, 93
      ecall
    `
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    return blob
  }

  get_blob_matrix(value, row, col){
    let code = `# Testing Code for Exercise 8.2.2 (matrix)
    .globl _start
    _start:
       li s0, 0xABCDEFAB
       li s1, 0xABCDEFAB
       li s2, 0xABCDEFAB
       li s3, 0xABCDEFAB
       li s4, 0xABCDEFAB
       li s5, 0xABCDEFAB
       li s6, 0xABCDEFAB
       li s7, 0xABCDEFAB
       li s8, 0xABCDEFAB
       li s9, 0xABCDEFAB
       li s10, 0xABCDEFAB
       li s11, 0xABCDEFAB
       li sp, 0x7FFFFFC
       addi sp, sp, -2016
       li t0, ${value}
       sw t0, ${4*(row*42 + col)}(sp)
       li t0, 0
       mv a0, sp
       li a1, ${row}
       li a2, ${col}
       jal value_matrix
       addi sp, sp, 2016
       li t0, 0xABCDEFAB
       bne s0, t0, __test_fail_callee_save
       bne s1, t0, __test_fail_callee_save
       bne s2, t0, __test_fail_callee_save
       bne s3, t0, __test_fail_callee_save
       bne s4, t0, __test_fail_callee_save
       bne s5, t0, __test_fail_callee_save
       bne s7, t0, __test_fail_callee_save
       bne s8, t0, __test_fail_callee_save
       bne s9, t0, __test_fail_callee_save
       bne s10, t0, __test_fail_callee_save
       bne s11, t0, __test_fail_callee_save
       li t0, 0x7FFFFFC
       bne sp, t0, __test_fail_callee_save
       li t0, ${value}
       bne t0, a0, __test_wrong_value
       li t1, 0
       li t2, 0
       j __after_check
    __test_fail_callee_save:
       li t1, 0
       li t2, 1
       j __after_check
    __test_wrong_value:
       li t1, 1
       li t2, 0
       j __after_check
    __after_check:
      li a0, 0
      li a7, 93
      ecall
    `
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    return blob
  }

  add_code(code_blob, name){
    let file = new File([code_blob], name);
    simulator_controller.load_new_file(file);
  }

}

new Ch8E2_2();