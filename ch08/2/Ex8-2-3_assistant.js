import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E2_3 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.2.3: Data Organization on the Memory");

    let code_int = this.get_blob("int");
    let code_short = this.get_blob("short");
    let code_char = this.get_blob("char");
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
        let t3 = (parseInt(await this.run_interactive_cmd("peek r t3")));

        let ind = t1*4 + t2*2 + t3;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          `Array incorrectly filled in position of index ${t3}`,
          "Return value was incorrect. Return value from 'mystery_function_int' must be returned",
          "Data structure should be stored in the program stack, in a memory space allocated inside your function (beware of buffer overflows)",
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
        let t3 = (parseInt(await this.run_interactive_cmd("peek r t3")));

        let ind = t1*4 + t2*2 + t3;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          `Array incorrectly filled in position of index ${t3}`,
          "Return value was incorrect. Return value from 'mystery_function_short' must be returned",
          "Data structure should be stored in the program stack, in a memory space allocated inside your function (beware of buffer overflows)",
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
        let t3 = (parseInt(await this.run_interactive_cmd("peek r t3")));

        let ind = t1*4 + t2*2 + t3;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          `Array incorrectly filled in position of index ${t3}`,
          "Return value was incorrect. Return value from 'mystery_function_char' must be returned",
          "Data structure should be stored in the program stack, in a memory space allocated inside your function (beware of buffer overflows)",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };

    this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
    this.ui.add_test("Test fill_array_int", int_test);
    this.ui.add_test("Test fill_array_short", short_test);
    this.ui.add_test("Test fill_array_char", char_test);
  
  
    this.ui.final_result = _ => {
      let grade = 0;
      let n_tests = this.ui.test_results.length
      for (let i = 0; i < n_tests; i++) {
        grade += this.ui.test_results[i];
      }
      grade = (grade * 10) / (n_tests);
      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});

      return `Grade: ${grade.toFixed(1)}.<br>Download testing code that was linked to your program (<a href=${window.URL.createObjectURL(code_int)} download="linked_code_int.s">int</a>, <a href=${window.URL.createObjectURL(code_short)} download="linked_code_short.s">short</a>, <a href=${window.URL.createObjectURL(code_char)} download="linked_code_char.s">char</a>).`
    }
  }

  randint(min, max) { 
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  get_blob(type){
    let type_specs = { // tuple (load/store type, size)
      "int": ["w", 4],
      "short": ["h", 2],
      "char": ["b", 1],
    };
    let specs = type_specs[type];
    let code = `# Testing Code for Exercise 8.2.3 (${type})
        .globl _start
        .globl mystery_function_int
        .globl mystery_function_short
        .globl mystery_function_char
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
           la t0, sp_bottom
           sw sp, 0(t0)
           li t0, 0
           jal fill_array_${type}
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
           la t0, array
           li t1, 0
           li t2, 100
           loop:
              l${specs[0]} t3, 0(t0)
              bne t1, t3, __test_wrong_value 
              addi t0, t0, ${specs[1]}
              addi t1, t1, 1
              blt t1, t2, loop
           bnez a0, __test_wrong_return
           la t0, data_structure_addr
           lw t1, 0(t0)
           lw t2, 4(t0)
           lw t3, 8(t0)
           addi t2, t2, ${specs[1]*-100} # check for buffer overflow
           bgtu t1, t2, __test_wrong_addr
           bltu t1, t3, __test_wrong_addr
           li t1, 0
           li t2, 0
           li t3, 0
           j __after_check
        __test_fail_callee_save:
           li t1, 0
           li t2, 0
           li t3, 1
           j __after_check
        __test_wrong_value:
           mv t3, t1
           li t1, 0
           li t2, 1
           li t3, 0
           j __after_check
        __test_wrong_return:
           li t1, 0
           li t2, 1
           li t3, 1
           j __after_check
        __test_wrong_addr:
           li t1, 1
           li t2, 0
           li t3, 0
           j __after_check 
        __after_check:
          li a0, 0
          li a7, 93
          ecall

        mystery_function_int:
          la t0, data_structure_addr
          sw a0, 0(t0)
          la t0, sp_top
          sw sp, 0(t0)
          la t0, array
          li t1, 100
          mystery_function_int_loop:
            lw t2, 0(a0)
            sw t2, 0(t0)
            addi t0, t0, 4
            addi a0, a0, 4
            addi t1, t1, -1
            bnez t1, mystery_function_int_loop
          li t0, 0
          li t2, 0
          li a0, 0
          ret

        mystery_function_short:
          la t0, data_structure_addr
          sw a0, 0(t0)
          la t0, sp_top
          sw sp, 0(t0)
          la t0, array
          li t1, 100
          mystery_function_short_loop:
            lh t2, 0(a0)
            sh t2, 0(t0)
            addi t0, t0, 2
            addi a0, a0, 2
            addi t1, t1, -1
            bnez t1, mystery_function_short_loop
          li t0, 0
          li t2, 0
          li a0, 0
          ret

        mystery_function_char:
          la t0, data_structure_addr
          sw a0, 0(t0)
          la t0, sp_top
          sw sp, 0(t0)
          la t0, array
          li t1, 100
          mystery_function_char_loop:
            lb t2, 0(a0)
            sb t2, 0(t0)
            addi t0, t0, 1
            addi a0, a0, 1
            addi t1, t1, -1
            bnez t1, mystery_function_char_loop
          li t0, 0
          li t2, 0
          li a0, 0
          ret

        .section .bss
        data_structure_addr: .skip 4
        sp_bottom: .skip 4
        sp_top: .skip 4
        array: .skip 400
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

new Ch8E2_3();