import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E1_2 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.1.2: ABI Compliance");
	
    let a = this.randint(1, 11);
    let b = this.randint(2, 11);
    let c = this.randint(2, 11);
    let aux = b - (((a+b) + a)*((a+b) - a)) + c; 
    let expected = c - ((aux + b)*(aux - b)) +  aux;
    let code_blob = this.get_blob(a, b, c, aux, expected);

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

        let ind = t1*4 + t2*2 + t3;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          "Function 'mystery_function' should be called only 2 times",
          "First parameter passed to first call of 'mystery_function' was incorrect",
          "Second parameter passed to first call of 'mystery_function' was incorrect",
          "First parameter passed to second call of 'mystery_function' was incorrect",
          "Second parameter passed to second call of 'mystery_function' was incorrect",
          "Function 'my_function' not working as expected"
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

  get_blob(a, b, c, aux, expected){
    let code = `# Testing Code for Exercise 8.1.2
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
       li a0, ${a}
       li a1, ${b}
       li a2, ${c}
       jal my_function
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
       la t0, index
       lw t0, 0(t0)
       li t1, 4
       bne t0, t1, __test_func_calls
       la t0, array
       lw t1, 0(t0)
       li t2, ${a+b}
       bne t1, t2, __test_value_0
       lw t1, 4(t0)
       li t2, ${a}
       bne t1, t2, __test_value_1
       lw t1, 8(t0)
       li t2, ${aux}
       bne t1, t2, __test_value_2
       lw t1, 12(t0)
       li t2, ${b}
       bne t1, t2, __test_value_3
       li t0, ${expected}
       bne a0, t0, __test_function_implementation
       li t1, 0
       li t2, 0
       li t3, 0
       j __after_check
    __test_fail_callee_save:
       li t1, 0
       li t2, 0
       li t3, 1
       j __after_check
    __test_func_calls:
       li t1, 0
       li t2, 1
       li t3, 0
       j __after_check
    __test_value_0:
       li t1, 0
       li t2, 1
       li t3, 1
       j __after_check
    __test_value_1:
       li t1, 1
       li t2, 0
       li t3, 0
       j __after_check
    __test_value_2:
       li t1, 1
       li t2, 0
       li t3, 1
       j __after_check
    __test_value_3:
       li t1, 1
       li t2, 1
       li t3, 0
       j __after_check
    __test_function_implementation:
       li t1, 1
       li t2, 1
       li t3, 1
       j __after_check
    __after_check:
      li a0, 0
      li a7, 93
      ecall
    
    mystery_function:
      la t0, index
      la t1, array
      lw t2, 0(t0)
      slli t3, t2, 2
      add t3, t1, t3
      sw a0, 0(t3)
      sw a1, 4(t3)
      addi t2, t2, 2
      sw t2, 0(t0)
      add t0, a0, a1
      sub t1, a0, a1
      mul a0, t0, t1
      ret

    .section .data
    index: .word 0
    .section .bss
    array: .skip 24
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

new Ch8E1_2();