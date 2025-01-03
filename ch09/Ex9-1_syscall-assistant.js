import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";

class Ex9_1 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper(`<h4>Exercise 9.1 - Syscalls</h4>\nUpload only ACOS file.`);

    let test_mode = async _ => {

      this.add_code(`
      .text
      .globl main
      main:
        li t1, 0xFFFF0100
        li a7, 9999
      _exception_test:
        sb t0, 0(t1)
      loop_infinito:
        j loop_infinito`, "main.s");


      this.default_filename = await this.compile_code();
      this.ui.log(this.stdoutBuffer); 
      this.ui.log(this.stderrBuffer); 
      this.log_output();
      this.log_input_files();
      if(!this.default_filename) return false;

      this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        return false;
      }

      let symbols = await this.get_symbols();
      await this.run_interactive_cmd(`until 0x${symbols["_exception_test"].toString(16)}`);
      let pc_before = (parseInt(await this.run_interactive_cmd("peek pc")));
      await this.run_interactive_cmd(`step`);
      let pc_after = (parseInt(await this.run_interactive_cmd("peek pc")));

      if(pc_after - pc_before == 4){
        this.ui.log("Control code is not in user mode."); 
        this.log("Control code is not in user mode."); 
        this.stop_simulator();
        return false;
      }
      this.stop_simulator();
      this.log_output();
      return true;
    }

    let compile = async _ => {

      let code = `
      .globl main
      .text
        main:
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
        __before_test:
        ecall
        __after_test:
        li t0, 0xABCDEFAB
        li t1, 1
        bne s0, t0, __test_fail
        bne s1, t0, __test_fail
        bne s2, t0, __test_fail
        bne s3, t0, __test_fail
        bne s4, t0, __test_fail
        bne s5, t0, __test_fail
        bne s7, t0, __test_fail
        bne s8, t0, __test_fail
        bne s9, t0, __test_fail
        bne s10, t0, __test_fail
        bne s11, t0, __test_fail
        j __after_check
        __test_fail:
        li t1, 0
        __after_check:`;
      this.add_code(code, "main.s")


      this.default_filename = await this.compile_code();
      this.ui.log(this.stdoutBuffer); 
      this.ui.log(this.stderrBuffer); 
      this.log_output();
      this.log_input_files();
      await this.run_simulator();
      this.symbols = await this.get_symbols();
      this.stop_simulator();
      if(!this.default_filename) return false;
      return true;
    }

    
    let report = new LocalReport();
    this.connections.push(report);
    this.predefined_args = ["--interactive", "--isa", "acdfimsu"];

    this.ui.add_test("User mode initialization", test_mode, {fail_early: true});
    this.ui.add_test("Compilation", compile, {fail_early: true});
    this.ui.add_test("set_engine_and_steering 1 (10)", this.simple_syscall_test({a0:1,a1:120,a7:10}, 0, undefined, [{addr:0xffff0321,size:1,val:1}, {addr:0xffff0320,size:1,val:120}]));
    this.ui.add_test("set_engine_and_steering 2 (10)", this.simple_syscall_test({a0:1,a1:145,a7:10}, 0xffffffff, undefined, [{addr:0xffff0321,size:1,val:0}, {addr:0xffff0320,size:1,val:0}]));
    this.ui.add_test("set_handbrake (11)", this.simple_syscall_test({a0:1,a7:11}, undefined, undefined, [{addr:0xffff0322,size:1,val:1}]));
    this.ui.add_test("read_sensors (12)", this.simple_syscall_test({a0:0xffff0124, a7:12}, undefined, [{addr:0xffff0324,size:1,val:212}, {addr:0xffff0360,size:1,val:98}, {addr:0xffff0423,size:1,val:20}, {addr:0xffff0301,size:1,val:0}], [{addr:0xffff0124,size:1,val:212}, {addr:0xffff0160,size:1,val:98}, {addr:0xffff0223,size:1,val:20}], 20000));
    this.ui.add_test("read_sensor_distance (13)", this.simple_syscall_test({a7:13}, 212, [{addr:0xffff031c,size:4,val:212}, {addr:0xffff0302,size:1,val:0}], 5000));
    this.ui.add_test("get_position (15)", this.simple_syscall_test({a0:0xffff0120, a1:0xffff0124, a2:0xffff0128, a7:15}, undefined, [{addr:0xffff0310,size:4,val:212}, {addr:0xffff0314,size:4,val:98}, {addr:0xffff0318,size:4,val:20}, {addr:0xffff0300,size:1,val:0}], [{addr:0xffff0120,size:4,val:212}, {addr:0xffff0124,size:4,val:98}, {addr:0xffff0128,size:4,val:20}], 10000));
    this.ui.add_test("get_rotation (16)", this.simple_syscall_test({a0:0xffff0120, a1:0xffff0124, a2:0xffff0128, a7:16}, undefined, [{addr:0xffff0304,size:4,val:212}, {addr:0xffff0308,size:4,val:98}, {addr:0xffff030C,size:4,val:20}, {addr:0xffff0300,size:1,val:0}], [{addr:0xffff0120,size:4,val:212}, {addr:0xffff0124,size:4,val:98}, {addr:0xffff0128,size:4,val:20}], 10000));
    this.ui.add_test("read_serial - read 1 byte (17)", this.simple_syscall_test({a0:0xffff0120, a1:1, a7:17}, 1, [{addr:0xffff0503, size:1,val:50}, {addr:0xffff0502,size:1,val:0}], [{addr:0xffff0120,size:1,val:50}], 10000));
    this.ui.add_test("read_serial - read 2 bytes (17)", this.simple_syscall_test({a0:0xffff0120, a1:2, a7:17}, undefined, [{addr:0xffff0503, size:1,val:50}, {addr:0xffff0502,size:1,val:0}], [{addr:0xffff0120,size:1,val:50}, {addr:0xffff0121,size:1,val:50}], 10000));
    this.ui.add_test("read_serial - read empty buffer (17)", this.simple_syscall_test({a0:0xffff0120, a1:2, a7:17}, 0, [{addr:0xffff0503, size:1,val:0}, {addr:0xffff0502,size:1,val:0}], [{addr:0xffff0120,size:1,val:0}], 10000));
    this.ui.add_test("write_serial - write 1 byte (18)", this.simple_syscall_test({a0:0xffff0120, a1:1, a7:18}, undefined, [{addr:0xffff0120, size:1,val:50}, {addr:0xffff0500,size:1,val:0}], [{addr:0xffff0501,size:1,val:50}], 10000));
    this.ui.add_test("write_serial - write 2 bytes (18)", this.simple_syscall_test({a0:0xffff0120, a1:2, a7:18}, undefined, [{addr:0xffff0120, size:1,val:50}, {addr:0xffff0121, size:1,val:51}, {addr:0xffff0500,size:1,val:0}], [{addr:0xffff0501,size:1,val:51}], 10));
    this.ui.add_test("get_systime (20)", this.simple_syscall_test({a7:20}, 100, [{addr:0xffff0104,size:4,val:100}, {addr:0xffff0100,size:1,val:0}], undefined, 10000));
  }

  simple_syscall_test(reg_input, expected_output, mmio_input, expected_mmio, timeout=2000){
    return async _ =>{
      this.predefined_args = ["--interactive", "--isa", "acdfimsu"];
      if(mmio_input){
        simulator_controller.set_int_freq_scale_limit(31);
      }
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        this.stop_simulator();
        return false;
      }

      
      await this.run_interactive_cmd(`until 0x${this.symbols["__before_test"].toString(16)}`, 3000);
      for (const reg in reg_input) {
        await this.run_interactive_cmd(`poke r ${reg} 0x${reg_input[reg].toString(16)}`);  
      }
      let interval = 0;
      if(mmio_input){
        // Set initial values
        for (let i = 0; i < mmio_input.length; i++) {
          const m = mmio_input[i];
          this.bus.mmio.store(m.addr, m.size, m.val);
        }
        // update in regular intervals 
        interval = setInterval(_ =>{
          for (let i = 0; i < mmio_input.length; i++) {
            const m = mmio_input[i];
            this.bus.mmio.store(m.addr, m.size, m.val);
          }
        }, 500);
      }
      await this.run_interactive_cmd(`until 0x${this.symbols["__after_check"].toString(16)}`, 3000);
      await this.sleep(timeout);
      if(mmio_input){
        clearInterval(interval);
      }
      let abi_check = (parseInt(await this.run_interactive_cmd("peek r t1")));
      if(abi_check == 0){
        this.ui.log("ABI test failed: s-register not saved.");
        this.stop_simulator();
        return false;
      }
      if(expected_output !== undefined){
        let result = (parseInt(await this.run_interactive_cmd("peek r a0")));
        if(expected_output != result){
          this.ui.log("Incorrect result.");
          this.stop_simulator();
          return false;
        }
      }
      if(expected_mmio){
        for (let i = 0; i < expected_mmio.length; i++) {
          const m = expected_mmio[i];
          const val = this.bus.mmio.load(m.addr, m.size);
          if(val != m.val){
            this.ui.log(`Incorrect MMIO write. Expected: ${m.val} Received: ${val}`);
            this.stop_simulator();
            return false;
          }
        }
      }
      this.stop_simulator();
      this.log_output();
      return true;
    };
  }

  add_code(code, name){
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], name);
    simulator_controller.load_new_file(file);
  }
}

new Ex9_1();
