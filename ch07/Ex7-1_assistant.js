import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import {LocalReport} from "./modules/connection.js";
import car from "./extensions/devices/self_driving_car.js"

class Ex7_1 extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper(`<h4>Exercise 7.1: Accessing Peripherals - Controlling the Car</h4><br>
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

    let vetor = [];
    let report = new LocalReport();
    this.connections.push(report);
    this.predefined_args = ["--newlib", "--setreg", "sp=0x7FFFFFC", "--isa", "acdfimsu"];
    this.ui.add_test(
      "Compilation",
      _ => {
        report.restart();
        return this.generic_compile_test()();
      } , 
      { fail_early: true }
    );
    this.ui.add_test("Parking Lot to Testing Track", async function () {
      car.set_state({x: 180.5, y: 2.6, z: -108.0}, {x: 0.17, y: -356.8, z: 0.0});
      car.position_log = [];
      vetor = [];
      if(!(await this.run_simulator())){
        this.ui.log("No file selected");
        this.log("No file selected");
        return false;
      }

      console.log("**********RUNNING************");

      const target = {x: 73.453, y: 1.376818, z: -19.79054}
      for (let t = 0; t < 360; t++) {
        car.unityModule.SendMessage("car", "getStatus");
        await this.sleep(500);
        console.log("**********ONE TIMESTEP************\n");
        if(car.position_log.length > 0){
          vetor = Array.from(car.position_log)
        }
        if (vetor.length > 0) {
          const pos = vetor[vetor.length - 1];
          const dist = Math.sqrt((target.x - pos.x)**2 + (target.y - pos.y)**2 + (target.z - pos.z)**2)
          console.log(`******** Car position at t=${t}: (${pos.x}, ${pos.y}, ${pos.z}). Distance from target at (${target.x}, ${target.y}, ${target.z}): ${dist}\n`);
          if(dist <= 15){
            this.log(car.collision_log);
            this.log(car.position_log);
            this.stop_simulator();
            return true;
          }
        }
      }
      console.log("***** Timeout Reached ********");
      this.log(car.collision_log);
      this.log(car.position_log);
      this.stop_simulator();
      return false;
    }.bind(this));

    this.ui.final_result = _ =>{
      report.report["test_results"] = this.ui.test_results;
      if(!this.ui.test_results[0]) return "";
      let grade = 0;
      for (let i = 1; i < this.ui.test_results.length; i++) {
        grade += this.ui.test_results[i]*10;
      }
      report.report["final_grade"] = grade;
      // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});
      let blob = report.generate_report();
      return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex7_1.report">(click here)</a>.`
    }
  }
}


new Ex7_1();
