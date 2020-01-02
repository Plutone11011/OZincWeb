import React from 'react';
//import oil from './oil.jpg';
import './Table.css';
import Table from 'react-bootstrap/Table'

class OilsTable extends React.Component {

  

  render(){
    
    if (this.props.results){
      //make an array of values ensuring it's in the same order as the keys
      const oil_names = Object.keys(this.props.results["Oils Composition:"]);
      const oil_values = oil_names.map(key => {
        return this.props.results["Oils Composition:"][key] ;
      });

      const target_name = this.props.results["Target name:"];
      const target_distance = this.props.results["Distance from target:"];

      const target_components_names = Object.keys(this.props.results['Target difference:']);
      const target_components_values = target_components_names.map(key => {
        return this.props.results['Target difference:'][key];
      });

      //const voc_concentrations = Function(`"use strict"; return ${this.props.results["VOC Concentrations:"]}`)();
      const voc_concentrations = JSON.parse(this.props.results["VOC Concentrations:"]);
      return (
        <div className="App">
          <p>{`Distanza dal target: ${target_distance}`}</p>
          <Table responsive="sm" bordered='true'>
            <thead>
              <tr>
                <th>\</th>
                {oil_names.map(oil_name => (
                  <th key={oil_name}>{oil_name}</th>
                ))}
                <th className="target-name">{target_name}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>%</td>
                {oil_values.map((oil_value, index) => (
                  <td key={`${oil_names[index]}%`}>{oil_value}</td>
                ))}
                <td className="target-name">100%</td>
              </tr>
              {target_components_names.map((target_component_name, index) => (
                <tr key={`${target_component_name}${index}`}> {/*create a row for each component, then a cell for each element of the index column of the matrix */}
                  <td key={target_component_name}>{target_component_name}</td>
                  {Array.from(voc_concentrations, array_concentration => array_concentration[index]).map((component_concentration, _index) => (
                    <td key={`${oil_names[_index]} x ${component_concentration}`}>{component_concentration}</td>
                  ))}
                  <td className="target-name" key={`${target_name} x ${target_component_name}`}>{target_components_values[index]}</td>
                </tr>
                  ))}
            </tbody>
          </Table>
        </div>
      );
    }
    else {
      return(
        <div className="App">
        </div>
      )
    }
  }
}

export default OilsTable;
