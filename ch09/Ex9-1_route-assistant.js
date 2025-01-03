import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import { simulator_controller } from "./modules/simulator.js";
import car from "./extensions/devices/self_driving_car.js"

class Routes extends Assistant_Script{
  constructor(){
    super();
    let route_id = 2; // Change this to other routes
    let route_names = ["A", "B", "C"] 
    let route_targets = [
      [
        {x: -16, y: 1, z: 7},
        {x: 146, y: 1, z: -1},
        {x: 160, y: 1, z: 205},
        {x: 285, y: 1, z: 210},
        {x: 285, y: 1, z: 8},
      ],
      [
        {x: -16, y: 1, z: 7},
        {x: 135, y: 1, z: -1},
        {x: 284, y: 1, z: -6},
        {x: 148, y: 1, z: 10},
        {x: -11, y: 1, z: 18},
      ],
      [
        {x: -16, y: 1, z: 7},
        {x: 135, y: 1, z: -1},
        {x: 284, y: 1, z: -6},
        {x: 160, y: 1, z: 14},
        {x: 160, y: 1, z: 203},
        {x: 19, y: 1, z: 213},
      ],
    ]
    this.ui = new UI_Helper(`<h4>Exercise 9.1 - Route ${route_names[route_id]}</h4><br>
    <button type="button" id="car_ini_pos" class="btn btn-primary">Set car to initial position</button>
    <button type="button" id="update_car_pos" class="btn btn-primary">Get car current position</button>
    <br>
    Last car position: <span id="car_current_pos"></span>`);

    document.getElementById("update_car_pos").onclick = _ => {car.unityModule.SendMessage("car", "getStatus");}
    document.getElementById("car_ini_pos").onclick = _ => {car.set_state({x: -16, y: 1, z: 7}, {x: 0, y: 93, z: 0.0});}


    setInterval(() => {
      if(car.position_log.length > 0){
        document.getElementById("car_current_pos").innerHTML = JSON.stringify(car.position_log[car.position_log.length - 1]);
      }
    }, 500);
    let test_route = async _ => {
      this.set_init_STDIN(`${route_id}\n`);
      car.set_state({x: -16, y: 1, z: 7}, {x: 0, y: 93, z: 0.0});
      car.position_log = [];
      this.predefined_args = ["--isa", "acdfimsu"];
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        return false;
      }
      const targets = route_targets[route_id]
      let target = targets.shift();
      for (let t = 0; t < 180; t++) {
        car.unityModule.SendMessage("car", "getStatus");
        await this.sleep(1000);
        
        console.log("**********ONE TIMESTEP************");

        const pos = car.position_log[car.position_log.length - 1];
        const dist = Math.sqrt((target.x - pos.x)**2 + (target.y - pos.y)**2 + (target.z - pos.z)**2)
        console.log(`******** Car position at t=${t}: (${pos.x}, ${pos.y}, ${pos.z}). Distance from target at (${target.x}, ${target.y}, ${target.z}): ${dist}`);
        if(dist <= 15){
          
          if (targets.length == 0){
            await this.sleep(3000);
            this.log(car.collision_log);
            this.log(car.position_log);
            this.stop_simulator();
            return true
          } 
          target = targets.shift();
        }
      }
      this.stop_simulator();
      this.log_output();
      return false; 
    }
    
    
    let report = new LocalReport();
    this.connections.push(report);
    
    this.ui.add_test(
      "Compilation",
      _ => {
        report.restart();
        this.add_code(`
            .globl A_0
            .globl B_0
            .globl C_0

            .data
            A_0: 
                .word -16 # x
                .word 1   # y 
                .word 7   # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 0   # action
                .word A_1 # *next
            .skip 10
            A_1: 
                .word 146 # x
                .word 1   # y 
                .word -1  # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 1   # action
                .word A_2 # *next
            .skip 5
            A_3:
                .word 285 # x
                .word 1   # y 
                .word 210 # z
                .word 0   # a_x
                .word 91   # a_y
                .word 0   # a_z
                .word 2   # action
                .word A_4 # *next
            A_2:
                .word 160 # x
                .word 1   # y 
                .word 205 # z
                .word 0   # a_x
                .word 2  # a_y
                .word 0   # a_z
                .word 2   # action
                .word A_3 # *next
            A_4:
                .word 285 # x
                .word 1   # y 
                .word 8  # z
                .word 0   # a_x
                .word 181 # a_y
                .word 0   # a_z
                .word 4   # action
                .word 0   # *next

            B_0: 
                .word -16 # x
                .word 1   # y 
                .word 7   # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 0   # action
                .word B_1 # *next
            .skip 5
            B_1: 
                .word 135 # x
                .word 1   # y 
                .word -1  # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 0   # action
                .word B_2 # *next
            .skip 10
            B_3:
                .word 148 # x
                .word 1   # y 
                .word 10  # z
                .word 0   # a_x
                .word 272  # a_y
                .word 0   # a_z
                .word 0   # action
                .word B_4 # *next
            .skip 4
            B_2:
                .word 284 # x
                .word 1   # y 
                .word -6  # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 3   # action
                .word B_3 # *next
            B_4:
                .word -11 # x
                .word 1   # y 
                .word 18  # z
                .word 0   # a_x
                .word 272  # a_y
                .word 0   # a_z
                .word 4   # action
                .word 0   # *next

            C_0:
                .word -16 # x
                .word 1   # y 
                .word 7   # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 0   # action
                .word C_1 # *next
            .skip 4
            C_1: 
                .word 135 # x
                .word 1   # y 
                .word -1  # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 0   # action
                .word C_2 # *next
            .skip 5
            C_2:
                .word 284 # x
                .word 1   # y 
                .word -6  # z
                .word 0   # a_x
                .word 93  # a_y
                .word 0   # a_z
                .word 3   # action
                .word C_3 # *next
            .skip 11
            C_3:
                .word 160 # x
                .word 1   # y 
                .word 14  # z
                .word 0   # a_x
                .word 272  # a_y
                .word 0   # a_z
                .word 2   # action
                .word C_4 # *next
            C_4:
                .word 160 # x
                .word 1   # y 
                .word 203   # z
                .word 0   # a_x
                .word 2  # a_y
                .word 0   # a_z
                .word 1   # action
                .word C_5 # *next
            C_5:
                .word 19  # x
                .word 1   # y 
                .word 213 # z
                .word 0   # a_x
                .word 271  # a_y
                .word 0   # a_z
                .word 4   # action
                .word 0   # *next`, "linked_lists.s");
        return this.generic_compile_test()();
      } , 
      { fail_early: true }
    );
    this.ui.add_test("Drive through route", test_route);



    this.ui.final_result = _ => {
      report.report["test_results"] = this.ui.test_results;
      let grade = 0;
      if (this.ui.test_results[0] != 0) {
        let n_tests = this.ui.test_results.length
        for (let i = 1; i < n_tests; i++) {
          grade += this.ui.test_results[i];
        }
        grade = (grade * 10) / (n_tests-1);
      }
      report.report["final_grade"] = grade;

      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="route_${route_names[route_id]}.report">(click here)</a>.`
    }
  }

  add_code(code, name){
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], name);
    simulator_controller.load_new_file(file);
  }
}

new Routes();
