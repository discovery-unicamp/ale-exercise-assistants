import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E1_4 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.1.4: ABI Compliance");
	
    let a = this.randint(1, 5000);
    let b = this.randint(1, 5000);
    let c = this.randint(1, 5000);
    let d = this.randint(1, 5000);
    let e = this.randint(0, 127);
    let f = this.randint(0, 127);
    let g = this.randint(1, 5000);
    let h = this.randint(1, 5000);
    let i = this.randint(0, 127);
    let j = this.randint(0, 127);
    let k = this.randint(1, 5000);
    let l = this.randint(1, 5000);
    let m = this.randint(1, 5000);
    let n = this.randint(1, 5000); 
    let expected = b + c - f + h + k - m;
    let code_blob = this.get_blob(a, b, c, d, e, f, g, h, i, j, k, l, m, n, expected);

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
        let a0 = (parseInt(await this.run_interactive_cmd("peek r a0")));

        let ind = t1*2 + t2;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          `Return value was incorrect.\nExpected = ${expected}, Returned Value = ${a0}.\nParameters: a = ${a}, b = ${b}, c = ${c},\nd = ${d}, e = ${e}, f = ${f}, g = ${g},\nh = ${h}, i = ${i}, j = ${j}, k = ${k},\nl = ${l}, m = ${m}, n = ${n}`,
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

  get_blob(a, b, c, d, e, f, g, h, i, j, k, l, m, n, expected){
    let code = `# Testing Code for Exercise 8.1.4
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
       li t0, ${expected}
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

new Ch8E1_4();