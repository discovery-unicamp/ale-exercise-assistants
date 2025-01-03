import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E1_1 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.1.1: ABI Compliance");
	
    let number = this.randint(3,8);
    let log_msg = "All checks passed!";
    let final_value = 11 + number;
    let code_blob = this.get_blob(number, final_value);
    let abi_test = async _ => {
        this.add_code(code_blob, "linked_code.s")
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

        if (t1 == 0){
          log_msg = "Global variable 'my_var' incorrecly initialized";
        } else if (t2 == 0){
          log_msg = "Callee save registers were not correctly restored";
        } else if (t3 == 0){
          log_msg = "Increment function 'increment_my_var' not working as requested";
        }
        
        this.stop_simulator();
        this.ui.log(log_msg);
        return (t1 && t2 && t3);
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

  get_blob(number, final_value){
    let code = `# Testing Code for Exercise 8.1.1
    .globl _start
    _start:
       la t5, my_var
       lw t6, 0(t5)
       li t5, 10
       bne t5, t6, __test_fail_initial_value
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
       jal increment_my_var
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
       la t5, my_var
       lw t6, 0(t5)
       li t5, 11
       bne t5, t6, __test_fail_increment
       ${Array(number).fill("jal increment_my_var\n").join("")}
       la t5, my_var
       lw t6, 0(t5)
       li t5, ${final_value}
       bne t5, t6, __test_fail_increment
       li t1, 1
       li t2, 1
       li t3, 1
       j __after_check
    __test_fail_initial_value:
       li t1, 0
       li t2, 1
       li t3, 1
       j __after_check
    __test_fail_callee_save:
       li t2, 0
       li t1, 1
       li t3, 1
       j __after_check
    __test_fail_increment:
       li t3, 0
       li t1, 1
       li t2, 1
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

new Ch8E1_1();