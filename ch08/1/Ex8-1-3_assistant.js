import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E1_3 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.1.3: ABI Compliance");
    
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

        let ind = t1*2 + t2;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          `Value for parameter ${t3+1} (${String.fromCharCode(97+t3)}) was incorrect`,
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

  get_blob(){
    let code = `# Testing Code for Exercise 8.1.3
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
       jal operation
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
       li t2, 1
       li t3, 1
       li t4, 14
       array_loop:
          lw t5, 0(t0)
          bne t2, t5, __test_wrong_value
          addi t0, t0, 4
          addi t1, t1, 1
          add t2, t2, t3
          neg t2, t2
          neg t3, t3 
          blt t1, t4, array_loop
       li t1, 0
       li t2, 0
       li t3, 0
       j __after_check
    __test_fail_callee_save:
       li t1, 0
       li t2, 1
       li t3, 0
       j __after_check
    __test_wrong_value:
       mv t3, t1
       li t1, 1
       li t2, 0
       j __after_check
    __after_check:
      li a0, 0
      li a7, 93
      ecall
    
    mystery_function:
      la t0, array
      sw a0, 0(t0)
      sw a1, 4(t0)
      sw a2, 8(t0)
      sw a3, 12(t0)
      sw a4, 16(t0)
      sw a5, 20(t0)
      sw a6, 24(t0)
      sw a7, 28(t0)
      lw t1, 0(sp)
      sw t1, 32(t0)
      lw t1, 4(sp)
      sw t1, 36(t0)
      lw t1, 8(sp)
      sw t1, 40(t0)
      lw t1, 12(sp)
      sw t1, 44(t0)
      lw t1, 16(sp)
      sw t1, 48(t0)
      lw t1, 20(sp)
      sw t1, 52(t0)
      li t0, 0
      li a0, 0
      ret

    .section .bss
    array: .skip 56
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

new Ch8E1_3();