enum Oils;
enum VOCs;

string: Target_name ;
float: MAX_COST ;
float: MAX_DIST;
% concentrations[v,o] = concentration of VOC v for oil o.
array [VOCs, Oils] of float: concentrations;

% concentrations_target[v] = concentration of VOC v for the target oil.
array [VOCs] of float: concentrations_target;

%indicates the acceptable difference from a VOC of the target
%the lower the threshold, the more the distance should be minimized
array [VOCs] of float: threshold;
%indicates how important a certain VOC is in relation to its sensitivity to the threshold
%the higher the sensitivity, the more the distance should be minimized  
array [VOCs] of float: sensitivity;

array [Oils] of float: costs ;
float :costs_target ;
% qty[o] = quantity of oil o (in fraction) in the final oil composition.
array [Oils] of var 0.0..1.0: qty;

% concentrations_comp[v] = concentration of VOC v in the final composition.
array [VOCs] of var float: concentrations_comp = [
  sum(o in Oils) (qty[o] * concentrations[v, o]) | v in VOCs
];

float :cost_factor ;
float :distance_factor ;
% the sum of the quantities must be 1.
constraint sum(qty) = 1.0;

% Manhattan distance between x and y.
function var float:
dist(array[int] of var float: x, array[int] of var float: y, array[int] of var float: th, array[int] of var float: s) = let {
  constraint assert(length(x) = length(y), "array lengths differ", true);
  constraint assert(length(y) = length(th), "array lengths differ", true);
} in sum([abs(x[i] - y[i]) * (s[i] / th[i]) | i in index_set(x)]);

var float: obj = dist(concentrations_comp, concentrations_target, threshold, sensitivity);
var float: total_cost = sum (oil in Oils) (qty[oil]*costs[oil]) ;

constraint total_cost <= MAX_COST ;
constraint obj <= MAX_DIST ;
% Minimising the distance from the concentrations of the target oil.
solve minimize distance_factor*(obj/MAX_DIST) + cost_factor*(total_cost/MAX_COST) ;

%output[(show_float(0, 2, qty[oil] * 100.0)) ++ "% " | oil in Oils]; 
output
  ["Oils Composition:\n"] ++ 
  [show("\(oil): \(show_float(0, 2, qty[oil] * 100))%") ++ "\n"| oil in Oils] ++
  ["\n----------\n"] ++
  ["VOC Concentrations:\n"] ++ 
  ["["] ++ 
  [if voc == 1 then "[" else "" endif ++ 
  (show_float(0, 2, concentrations[voc, oil] * qty[oil])) ++  
   if voc == 70 /\ oil != 10 then "]," else if voc == 70 /\ oil == 10 then "]" else ", " endif endif
   | oil in Oils, voc in VOCs] ++ 
  ["]\n"] ++
  ["\n----------\n"] ++
  ["Target name:\n" ++ Target_name] ++
  ["\n----------\n"]++
  ["Target difference:\n"] ++
  [show("\(voc): \(show_float(0, 4, concentrations_comp[voc] - concentrations_target[voc]))") ++ "\n" | voc in VOCs] ++
  ["\n----------\n"]++
  ["Cost factor:\n"] ++
  [show_float(1,2,cost_factor) ++ "\n"] ++
  ["\n----------\n"]++
  ["Distance factor:\n"] ++
  [show_float(1,2,distance_factor) ++ "\n"] ++
  ["\n----------\n"] ++
  ["Distance from target:\n"] ++ 
  [show_float(1, 2, sum (voc in VOCs) (abs(concentrations_comp[voc] - concentrations_target[voc]))) ++ "\n"] ++
  ["\n----------\n"] ++
  ["Total price:\n"] ++
  [show_float(1,2, total_cost)] 
