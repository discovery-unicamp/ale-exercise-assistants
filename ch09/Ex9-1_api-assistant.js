import {UI_Helper, Assistant_Script} from "./modules/assistant.js"
import { simulator_controller } from "./modules/simulator.js";

class ApiTest extends Assistant_Script{
  constructor(){
    super();
    this.ui = new UI_Helper("<h4>Exercise 9.1 - Control Library</h4>\nUpload CoLib and ACOS files.");
 
    this.predefined_args = ["--isa", "acdfimsu"];
    const number = this.randint(1000,5000);
    console.log(number);
    let nodes = [
      this.generate_node(),
      this.generate_node(),
    ];
    this.ui.add_test("Compilation", async _ => {

      this.add_exemplo(number, nodes);
      this.default_filename = await this.compile_code();
      this.ui.log(this.stdoutBuffer); 
      this.ui.log(this.stderrBuffer); 
      if(this.default_filename) return true;
      return false;
    }, {fail_early: true});
    this.ui.add_test("Case 0", this.simple_equality_test(`0\n`, `0\n`));
    const str_test = Math.random().toString(36);
    this.ui.add_test("Case 1", this.simple_equality_test(`1\n${str_test}\n`, `${str_test}\n`));
    this.ui.add_test("Case 2", this.simple_equality_test(`2\n`, `${number}\n`));
    const number2 = this.randint(0,1000000);
    this.ui.add_test("Case 3", this.simple_equality_test(`3\n${number2}\n`, `${number2.toString(16)}\n`, {compare_function: ((a,b) => a.toLowerCase() == b.toLowerCase())}));
    this.ui.add_test("Case 4", this.simple_equality_test(`4\n${str_test}\n`, `${str_test.length}\n`));
    this.ui.add_test("Case 5", this.simple_equality_test(`5\n`, `Value Greater than 0\n`,  {timeout:10000, compare_function: (a,b) => {
      return (parseInt(a) > 0);
    }}));
    this.ui.add_test("Case 6", this.simple_equality_test(`6\n`, `${Math.round(Math.sqrt(number))}\n`,  {compare_function: (a,b) => {
      const error = Math.abs(parseInt(a) - parseInt(b));
      if(!isNaN(error) && error < 10) return true;
      return false;
    }}));
    this.ui.add_test("Case 7", this.simple_equality_test(`7\n`, `${this.distance(nodes[0], nodes[1])}\n`,  {compare_function: (a,b) => {
      const error = Math.abs(parseInt(a) - parseInt(b));
      if(!isNaN(error) && error < 10) return true;
      return false;
    }}));
    this.ui.add_test("Case 8", this.simple_equality_test(`8\n`, `${nodes[0].x}|${nodes[0].y}|${nodes[0].z}|${nodes[0].a_x}|${nodes[0].a_y}|${nodes[0].a_z}|${nodes[0].action}|1\n`));
    this.ui.add_test("Case 9", this.simple_equality_test(`9\n`, `${nodes[1].x}|${nodes[1].y}|${nodes[1].z}|${nodes[1].a_x}|${nodes[1].a_y}|${nodes[1].a_z}|${nodes[1].action}|0\n`));

    

  }

  distance(node_0, node_1){
    return Math.round(Math.sqrt(Math.pow(node_0.x - node_1.x, 2) + Math.pow(node_0.y - node_1.y, 2) + Math.pow(node_0.z - node_1.z, 2)));
  }

  generate_node(){
    return {
      x: this.randint(-400, 400),
      y: this.randint(-400, 400),
      z: this.randint(-400, 400),
      a_x: this.randint(0, 359),
      a_y: this.randint(0, 359),
      a_z: this.randint(0, 359),
      action: this.randint(0, 4),
    }
  }
  add_exemplo(number, nodes){
    let actions = [
      "GoForward",
      "TurnLeft",
      "TurnRight",
      "GoBack",
      "End",
    ]
    const code = `
    #define NULL 0

    typedef enum Action { GoForward, TurnLeft, TurnRight, GoBack, End } Action;

    typedef struct Node {
        int x, y, z; // GPS coordinates
        int a_x, a_y, a_z; // Euler Angles for adjustments
        Action action; // Actions to perform
        struct Node *next; // Next node
    } Node;

    void puts ( const char * str );
    char * gets ( char * str );
    int atoi (const char * str);
    char *  itoa ( int value, char * str, int base );
    unsigned int get_time(void);
    int approx_sqrt(int x, int iterations);
    int get_distance(int x_c, int y_c, int z_c, int x_t, int y_t, int z_t);
    int strlen_custom ( const char *str );
    Node *fill_and_pop(Node *head, Node *fill);


    char buffer[100];
    int number = ${number}; // variable staticaly set by the assistant
    Node node_0; // variable staticaly set by the assistant
    Node node_1; // variable staticaly set by the assistant

    void print_node(Node *node, char *str_pointer){
        int legth, has_next = 0;
        str_pointer = itoa(node->x, str_pointer, 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        itoa(node->y, &str_pointer[legth + 1], 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        itoa(node->z, &str_pointer[legth + 1], 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        itoa(node->a_x, &str_pointer[legth + 1], 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        itoa(node->a_y, &str_pointer[legth + 1], 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        itoa(node->a_z, &str_pointer[legth + 1], 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        itoa((int) node->action, &str_pointer[legth + 1], 10);
        legth = strlen_custom(str_pointer);
        str_pointer[legth] = '|';
        if (node-> next != NULL){
            has_next = 1;
        }
        itoa(has_next, &str_pointer[legth + 1], 16);
        puts(str_pointer);
    }

    void run_operation(int op){
        int t0, t1, i;
        node_0.x = ${nodes[0].x}; node_0.y = ${nodes[0].y}; node_0.z = ${nodes[0].z}; node_0.a_x = ${nodes[0].a_x}; node_0.a_y = ${nodes[0].a_y}; node_0.a_z = ${nodes[0].a_z}; node_0.action = ${actions[nodes[0].action]}; node_0.next = &node_1;
        node_1.x = ${nodes[1].x}; node_1.y = ${nodes[1].y}; node_1.z = ${nodes[1].z}; node_1.a_x = ${nodes[1].a_x}; node_1.a_y = ${nodes[1].a_y}; node_1.a_z = ${nodes[1].a_z}; node_1.action = ${actions[nodes[1].action]}; node_1.next = NULL;
        
        Node fill, *linked_list = &node_0;
        switch (op){
            case 0:
                puts(buffer);
                break;

            case 1:
                gets(buffer);
                puts(buffer);
                break;
            case 2:
                puts(itoa(number, buffer, 10));
                break;
            case 3:
                puts(itoa(atoi(gets(buffer)), buffer, 16));
                break;
            case 4:
                gets(buffer);
                puts(itoa(strlen_custom(buffer), buffer, 10));
                break;
            case 5:
                t0 = get_time();
                t1 = get_time();
                puts(itoa(t1-t0, buffer, 10));
                break;
            case 6:
                puts(itoa(approx_sqrt(number, 40), buffer, 10));
                break;
            case 7:
                puts(itoa(get_distance(node_0.x, node_0.y, node_0.z, node_1.x, node_1.y, node_1.z), buffer, 10));
                break;
            case 8:
                fill_and_pop(linked_list, &fill);
                print_node(&fill, buffer);
                break;
            case 9:
                linked_list = fill_and_pop(linked_list, &fill);
                print_node(linked_list, buffer);
                break;
            default:
                break;
        }
    }

    int main(){
        int operation = atoi(gets(buffer));
        run_operation(operation);
        while(1);
        return 0;
    }  
    `
    let data = new TextEncoder("utf-8").encode(code);
    let blob = new Blob([data], {type: "application/octet-stream"});
    let file = new File([blob], "main.c");
    simulator_controller.load_new_file(file);
  }


  randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


}

new ApiTest();
