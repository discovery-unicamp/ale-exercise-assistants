import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";
import car from "./extensions/devices/self_driving_car.js"

class Ex7_4 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper(`<h4>Exercise 7.4: Software Interrupts - Controlling the Car</h4><br>
    <button type="button" id="car_ini_pos" class="btn btn-primary">Set car to initial position</button>
    <button type="button" id="update_car_pos" class="btn btn-primary">Get car current position</button>
    <br>
    Last car position: <span id="car_current_pos"></span>`);

    document.getElementById("update_car_pos").onclick = _ => {car.unityModule.SendMessage("car", "getStatus");}
    document.getElementById("car_ini_pos").onclick = _ => {car.set_state({x: 180.5, y: 2.6, z: -108.0}, {x: 0.17, y: -356.8, z: 0.0});}


    setInterval(() => {
      if(car.position_log.length > 0){
        document.getElementById("car_current_pos").innerHTML = JSON.stringify(car.position_log[car.position_log.length - 1]);
      }
    }, 500);

    let test_mode = async _ => {

      this.add_code(`
      .text
      .globl user_main
      user_main:
        li t1, 0xFFFF0100
        li a7, 9999
      _exception_test:
        sb t0, 0(t1)
        jal control_logic
      infinite_loop:
        j infinite_loop`, "main.s");


      this.default_filename = await this.compile_code();
      this.ui.log(this.stdoutBuffer); 
      this.ui.log(this.stderrBuffer); 
      this.log_output();
      this.log_input_files();
      if(!this.default_filename) return false;

      car.set_state({x: 180.5, y: 2.6, z: -108.0}, {x: 0.17, y: -356.8, z: 0.0});
      car.position_log = [];
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
        this.ui.log("Control logic code is not in user mode."); 
        this.log("Control logic code is not in user mode."); 
        this.stop_simulator();
        return false;
      }
      this.stop_simulator();
      this.log_output();
      return true;
    }

    let test_carro = async _ => {
      this.add_code(`
        .text
        .globl user_main
        user_main:
          jal control_logic
        infinite_loop: 
        j infinite_loop
      
        `, "main.s")

      this.default_filename = await this.compile_code();
      this.ui.log(this.stdoutBuffer); 
      this.ui.log(this.stderrBuffer); 
      this.log_output();
      this.log_input_files();
      if(!this.default_filename) return false;

      car.set_state({x: 180.5, y: 2.6, z: -108.0}, {x: 0.17, y: -356.8, z: 0.0});
      car.position_log = [];
      this.predefined_args = ["--isa", "acdfimsu"];
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        return false;
      }
      const target = {x: 73.453, y: 1.376818, z: -19.79054}
      for (let t = 0; t < 180; t++) {
        car.unityModule.SendMessage("car", "getStatus");
        await this.sleep(1000);
        console.log("**********ONE TIMESTEP************");

        const pos = car.position_log[car.position_log.length - 1];
        const dist = Math.sqrt((target.x - pos.x)**2 + (target.y - pos.y)**2 + (target.z - pos.z)**2)
        console.log(`******** Car position at t=${t}: (${pos.x}, ${pos.y}, ${pos.z}). Distance from target at (${target.x}, ${target.y}, ${target.z}): ${dist}`);
        if(dist <= 20){
          this.log(car.collision_log);
          this.log(car.position_log);
          this.stop_simulator();
          return true;
        }
      }
      this.stop_simulator();
      this.log_output();
      return false;
    }
    
    
    let report = new LocalReport();
    this.connections.push(report);
    this.predefined_args = ["--interactive", "--isa", "acdfimsu"];

    this.ui.add_test(
      "User mode test",
      _ => {
        report.restart();
        return test_mode();
      }, 
      {fail_early: true});
    this.ui.add_test("Car control logic test", test_carro);


    this.ui.final_result = _ => {
      report.report["test_results"] = this.ui.test_results;
      let grade = 0;
      for (let i = 0; i < this.ui.test_results.length; i++) {
        grade += this.ui.test_results[i]*5;
      }
      report.report["final_grade"] = grade;

      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});
      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex7_4.report">(click here)</a>.`
    }
  }

  add_code(code, name){
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], name);
    simulator_controller.load_new_file(file);
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}

new Ex7_4();
