import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class Ch8E3_5 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("Exercise 8.3.5: Stack and Frame Pointers");
    
    let array = this.generate_array()

    let n_calls = this.calls(0, array.length-1);
    
    let code = this.get_blob(array, n_calls);
    let data = this.get_data(array);

    let test = async _ => {
        this.add_code(code, "linked_code.s");
        this.add_code(data, "data.s");
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
        let a0 = (parseInt(await this.run_interactive_cmd("peek r a0")));

        let result = await this.run_interactive_cmd(`peek m 0x${a0.toString(16)} 0x${(a0+(array.length*4)).toString(16)}`)

        let ind = t1*4 + t2*2 + t3;

        let log_msgs = [
          "All checks passed!",
          "Callee save registers were incorrectly used",
          `Merge Sort result was incorrect.\nArray was not sorted.\nArray: ${this.convert_array(result, array.length)}`,
          `Recursive function was called less times than expected (${a0} < ${n_calls}).\nCheck if you are correclty calling 'mystery_function' inside of your recursive function.`,
          `The number of times the recursive function was called exceeds the expected number of calls for the given array, which is ${n_calls}.`,
          "Stack (sp) should be aligned on a 16-byte boundary.",
          "Unable to reach end of stack trace.\nPlease make sure frame pointer (fp) is being correctly used and that its previous values are beind saved on the correct position of the stack frame.",
        ]

        
        this.stop_simulator();
        this.ui.log(log_msgs[ind]);
        return (ind == 0);
    };

    
    this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
    this.ui.add_test("Test merge_sort", test);
  
  
    this.ui.final_result = _ => {
      let grade = 0;
      let n_tests = this.ui.test_results.length
      for (let i = 0; i < n_tests; i++) {
        grade += this.ui.test_results[i];
      }
      grade = (grade * 10) / (n_tests);
      window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});
      return `Grade: ${grade.toFixed(1)}.<br>Download testing code that was linked to your program (<a href=${window.URL.createObjectURL(code)} download="linked_code.s">code</a>, <a href=${window.URL.createObjectURL(data)} download="data.s">data</a>).`
      
    }
  }

  convert_array(data_layout, size){
    let array = [];
    let values = 0;
    let lines = data_layout.split("\n")
    for (const line of lines){
      if (line == ""){
        continue;
      }
      let data = line.split(":")[1];
      console.log(data);
      array.push(parseInt(data));
      values++;
      if (values >= size){
        break;
      }
    }
    return array;
  }

  calls(start, end){
    if (start < end){
      let mid = start + Math.floor((end - start) / 2);
      return 1 + this.calls(start, mid) + this.calls(mid+1, end);
    }
    return 1;
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  get_blob(array, max_calls){
    let code = `# Testing Code for Exercise 8.3.5
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
       li sp, 0x7FFFFE0
       la a0, array
       li a1, 0
       li a2, ${array.length - 1}
       jal merge_sort
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
       li t0, 0x7FFFFE0
       bne sp, t0, __test_fail_callee_save
       la a0, array
       mv t0, a0
       lw a1, 0(t0)
       li t1, ${array.length - 1}
       check_loop:
        beqz t1, check_loop_end
        addi t0, t0, 4
        addi t1, t1, -1
        lw a2, 0(t0)
        bgt a1, a2, __test_wrong_order
        mv a1, a2
        j check_loop
       check_loop_end:
       la t0, current_call
       lw t0, 0(t0)
       li t1, ${max_calls}
       bne t0, t1, __test_calls
       li t1, 0
       li t2, 0
       li t3, 0
       j __after_check
    __test_fail_callee_save:
       li t1, 0
       li t2, 0
       li t3, 1
       j __after_check
    __test_wrong_order:
       li t1, 0
       li t2, 1
       li t3, 0
       j __after_check
    __test_calls:
       li t1, 0
       li t2, 1
       li t3, 1
       la a0, current_call
       lw a0, 0(a0)
       j __after_check
    __test_exceed_calls:
       li t1, 1
       li t2, 0
       li t3, 0
       j __after_check
    __test_alignment_16:
       li t1, 1
       li t2, 0
       li t3, 1
       j __after_check
    __test_fp_placement:
       li t1, 1
       li t2, 1
       li t3, 0
       j __after_check
    __after_check:
      li a0, 0
      li a7, 93
      ecall

    mystery_function:
      la t0, current_call
      lw t1, 0(t0)
      addi t1, t1, 1
      li t2, ${max_calls}
      bgt t1, t2, __test_exceed_calls
      sw t1, 0(t0)
      mv t0, fp
      mv t1, sp
      li t2, 16
      loop:
        rem t3, t1, t2
        bnez t3, __test_alignment_16
        bltu t0, t1, __test_fp_placement
        mv t1, t0
        lw t0, -8(t0)
        li t3, 0x7FFFFE0 
        bne t1, t3, loop
      li t0, 0
      li t1, 0
      li t2, 0
      li t3, 0
      li t4, 0
      ret


    .data
    current_call: .word 0
    `
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    return blob
  }

  generate_array(){
    let length = this.randint(15, 20);
    return Array.from({length: length}, () => Math.floor(Math.random() * 100));
  }

  get_data(array){
    let array_init = [];
    for (let i = 0; i < array.length; i++) {
      array_init.push(`.word ${array[i]}`);      
    };

    const code = `# Data for Exercise 8.3.5
    .globl array
    .data
    array:
      ${array_init.join('\n        ')}
    `
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], "data.s");
    simulator_controller.load_new_file(file);
    return blob;
  }

  add_code(code_blob, name){
    let file = new File([code_blob], name);
    simulator_controller.load_new_file(file);
  }

}

new Ch8E3_5();