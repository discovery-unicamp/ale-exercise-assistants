import { UI_Helper, Assistant_Script } from "./modules/assistant.js";
import {LocalReport} from "./modules/connection.js";

class Ex6_2 extends Assistant_Script {
  constructor() {
    super();
    this.ui = new UI_Helper("Exercise 6.2: GPS");
    let report = new LocalReport();
    this.connections.push(report);

    this.ui.add_test(
      "Compilation",
      _ => {
        report.restart();
        return this.generic_compile_test()();
      } , 
      { fail_early: true }
    );
    
    this.ui.add_test(
      "Test 1 (question)",
      this.simple_equality_test(
        "+0700 -0100\n2000 0000 2240 2300\n",
        "-0088 +0016\n",
        { compare_function: this.compare_sqrt }
      )
    );
    this.ui.add_test(
      "Test 2 (question)",
      this.simple_equality_test(
        "+1042 -2042\n6823 4756 6047 9913\n",
        "-0902 -0215\n",
        { compare_function: this.compare_sqrt }
      )
    );
    this.ui.add_test(
      "Test 3 (question)",
      this.simple_equality_test(
        "-2168 +0280\n3207 5791 3638 9550\n",
        "+0989 -1626\n",
        { compare_function: this.compare_sqrt }
      )
    );
    this.ui.add_test(
      "Test 4 (question)",
      this.simple_equality_test(
        "-2491 +0965\n2884 7511 2033 9357\n",
        "-0065 -1941\n",
        { compare_function: this.compare_sqrt }
      )
    );
    this.ui.add_test(
      "Test 5 (question)",
      this.simple_equality_test(
        "-0656 +1337\n0162 2023 1192 9133\n",
        "+1255 -2381\n",
        { compare_function: this.compare_sqrt }
      )
    );
    for (let i = 6; i <= 10; i++) {
      let random_test = this.generate_test();
      this.ui.add_test(
        `Test ${i}`,
        this.simple_equality_test(
          random_test[0],
          random_test[1],
          {compare_function: this.compare_sqrt}
          )
        );
    }

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

        // window.parent.postMessage({comment: this.ui.test_results, grade: grade, finish_test: true});
  
        let blob = report.generate_report();
        return `Grade: ${grade}. Download your test report from Assistant execution <a href=${window.URL.createObjectURL(blob)} download="ex6_2.report">(click here)</a>.`
      }
  }

  randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  compare_sqrt(x, y) {
    x = x.trim().split(/\s+/);
    y = y.trim().split(/\s+/);
    if(x.length != 2) return false;
    for (let i = 0; i < 2; i++) {
      const error = Math.abs(x[i] - y[i]);
      if(isNaN(error) || error > 10) return false;
    }
    return true;
  }

  get_pos_str(val){
    if (val >= 0)
      return `+${String(val).padStart(4, '0')}`;
    return `-${String(Math.abs(val)).padStart(4, '0')}`;
  }

  get_t_str(val){
    return `${String(val).padStart(4, '0')}`;
  }

  babylonian_method(X){
    let k = Math.trunc(X/2);
    for (let i = 0; i < 21; i++) {
      k = Math.trunc((k + Math.trunc(X/k))/2);
    }
    return k;
  }

  check_validity(Y_b, X_c, T_a, T_b, T_c, T_r, x, y){
    let d_a, d_b, d_c;
    d_a = Math.trunc((T_r - T_a)*3/10);
    d_b = Math.trunc((T_r - T_b)*3/10);
    d_c = Math.trunc((T_r - T_c)*3/10);
    let y_result = Math.trunc((Math.pow(d_a, 2) + Math.pow(Y_b, 2) - Math.pow(d_b, 2))/(2*Y_b));
    if (Math.pow(d_a, 2) - Math.pow(y_result, 2) < 16){
      return false;
    };
    let x_result = this.babylonian_method(Math.pow(d_a, 2) - Math.pow(y_result, 2));
    if ((Math.abs(y_result - y) > 10) || Math.abs((Math.abs(x) - Math.abs(x_result))) > 10){
      return false;
    }
    return true;
  }
  generate_test() {
    let T_a, T_b, T_c, T_r;
    let X_c, Y_b, x, y;
    do{
      T_a, T_b, T_c;
      X_c = this.randint(-2000, 2000);
      Y_b = this.randint(-2000, 2000);
      x = this.randint(Math.max(X_c - 2000, -2000), Math.min(X_c + 2000, 2000));
      y = this.randint(Math.max(Y_b - 2000, -2000), Math.min(Y_b + 2000, 2000));
      
      T_a = Math.round(-(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))*10)/3);
      T_b = Math.round(-(Math.sqrt(Math.pow(x, 2) + Math.pow(y - Y_b, 2))*10)/3);
      T_c = Math.round(-(Math.sqrt(Math.pow(x - X_c, 2) + Math.pow(y, 2))*10)/3);

      T_r = this.randint(Math.abs(Math.min(T_a, T_b, T_c)), 10000);

      T_a = T_r + T_a;
      T_b = T_r + T_b;
      T_c = T_r + T_c;

    } while (!this.check_validity(Y_b, X_c, T_a, T_b, T_c, T_r, x, y));
    

    let input = `${this.get_pos_str(Y_b)} ${this.get_pos_str(X_c)}\n`;
    input += `${this.get_t_str(T_a)} ${this.get_t_str(T_b)} ${this.get_t_str(T_c)} ${this.get_t_str(T_r)}\n`

    let output = `${this.get_pos_str(x)} ${this.get_pos_str(y)}\n`;
    return [input, output];
  }
}

new Ex6_2();


