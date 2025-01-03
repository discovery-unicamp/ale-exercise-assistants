import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E2_5 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.2.5: Data Organization on the Memory");

    let code_blob = this.get_blob();
    let abi_test = async _ => {
      this.add_code(code_blob, "linked_code.s");
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
          "Node's first field (a) was not initialized correctly",
          "Node's second field (b) was not initialized correctly",
          "Node's third field (c) was not initialized correctly",
          "Node's fourth field (d) was not initialized correctly",
          "Returned value should be the value returned by 'mystery_function'",
          "Data structure should be stored in the program stack, in a memory space allocated inside your function (beware of buffer overflows)",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };
    this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
    this.ui.add_test("Test", abi_test, { fail_early: true }
    );
  
  
    this.ui.final_result = _ => {
      let grade = this.ui.test_results[0] ?10 :0;
      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});

      return `Grade: ${grade}.<br>Download testing code that was linked to your program <a href=${window.URL.createObjectURL(code_blob)} download="linked_code.s">(here)</a>.`
    }
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  get_blob(){
    let code = `# Testing Code for Exercise 8.2.5
    .globl _start
    .globl mystery_function
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
       jal node_creation
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
       la t0, node
       lw t1, 0(t0)
       li t2, 30
       bne t1, t2, __test_wrong_value_0
       lb t1, 4(t0)
       li t2, 25
       bne t1, t2, __test_wrong_value_1
       lb t1, 5(t0)
       li t2, 64
       bne t1, t2, __test_wrong_value_2
       lh t1, 6(t0)
       li t2, -12
       bne t1, t2, __test_wrong_value_3
       bnez a0, __test_wrong_return
       la t0, data_structure_addr
       lw t1, 0(t0)
       lw t2, 4(t0)
       lw t3, 8(t0)
       addi t2, t2, -8 # check for buffer overflow
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
    __test_wrong_value_0:
       li t1, 0
       li t2, 1
       li t3, 0
       j __after_check
    __test_wrong_value_1:
       li t1, 0
       li t2, 1
       li t3, 1
       j __after_check
    __test_wrong_value_2:
       li t1, 1
       li t2, 0
       li t3, 0
       j __after_check
    __test_wrong_value_3:
       li t1, 1
       li t2, 0
       li t3, 1
       j __after_check
    __test_wrong_return:
       li t1, 1
       li t2, 1
       li t3, 0
       j __after_check
    __test_wrong_addr:
       li t1, 1
       li t2, 1
       li t3, 1
       j __after_check
    __after_check:
      li a0, 0
      li a7, 93
      ecall
    
    mystery_function:
      la t0, data_structure_addr
      sw a0, 0(t0)
      la t0, sp_top
      sw sp, 0(t0)
      la t0, node
      lw t1, 0(a0)
      sw t1, 0(t0)
      lb t1, 4(a0)
      sb t1, 4(t0)
      lb t1, 5(a0)
      sb t1, 5(t0)
      lh t1, 6(a0)
      sh t1, 6(t0)
      li t0, 0
      li t1, 0
      li a0, 0
      ret
    .section .bss
    data_structure_addr: .skip 4
    sp_bottom: .skip 4
    sp_top: .skip 4
    node: .skip 8
    `;
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    return blob
  }

  add_code(code_blob, name){
    let file = new File([code_blob], name);
    simulator_controller.load_new_file(file);
  }

}

new Ch8E2_5();