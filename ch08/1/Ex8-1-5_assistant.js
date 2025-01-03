import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E1_5 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.1.5: ABI Compliance");

    let a = this.randint(1, 5000);
    let b = this.randint(1, 5000);
    let c = this.randint(1, 5000);
    let d = this.randint(1, 5000);
    let e = this.randint(1, 5000);
    let f = this.randint(1, 5000);
    let g = this.randint(1, 5000);
    let h = this.randint(1, 5000);
    let i = this.randint(1, 5000);
    let j = this.randint(1, 5000);
    let k = this.randint(1, 5000);
    let l = this.randint(1, 5000);
    let m = this.randint(1, 5000);
    let n = this.randint(1, 5000);
    
    let code_blob = this.get_blob(a, b, c, d, e, f, g, h, i, j, k, l, m, n);

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
          `Value for parameter ${t3+1} (${String.fromCharCode(110-t3)}) passed to 'mystery_function' was incorrect`,
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

  get_blob(a, b, c, d, e, f, g, h, i, j, k, l, m, n){
    let code = `# Testing Code for Exercise 8.1.5
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
       addi sp, sp, -32
       li a0, ${a}
       li a1, ${b}
       li a2, ${c}
       li a3, ${d}
       li a4, ${e}
       li a5, ${f}
       li a6, ${g}
       li a7, ${h}
       li t0, ${i}
       sw t0, 0(sp)
       li t0, ${j}
       sw t0, 4(sp)
       li t0, ${k}
       sw t0, 8(sp)
       li t0, ${l}
       sw t0, 12(sp)
       li t0, ${m}
       sw t0, 16(sp)
       li t0, ${n}
       sw t0, 20(sp)
       li t0, 0
       jal operation
       addi sp, sp, 32
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
       lw t2, 0(t0)
       li t3, ${n}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 4(t0)
       li t3, ${m}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 8(t0)
       li t3, ${l}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 12(t0)
       li t3, ${k}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 16(t0)
       li t3, ${j}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 20(t0)
       li t3, ${i}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 24(t0)
       li t3, ${h}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 28(t0)
       li t3, ${g}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 32(t0)
       li t3, ${f}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 36(t0)
       li t3, ${e}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 40(t0)
       li t3, ${d}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 44(t0)
       li t3, ${c}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 48(t0)
       li t3, ${b}
       bne t2, t3, __test_wrong_value
       addi t1, t1, 1
       lw t2, 52(t0)
       li t3, ${a}
       bne t2, t3, __test_wrong_value
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
      li t1, 0
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

new Ch8E1_5();