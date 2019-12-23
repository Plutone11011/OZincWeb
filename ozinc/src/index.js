import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import {
    BrowserRouter,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'
//Custom components
import OilsTable from './Table';
import ChangeInputData from './ChangeInputData';

class App extends React.Component{
    constructor(props){
        super(props);
        //state
        this.state = {
            target: null,
            result: null,
            isLoading: false,
            hidden: false
        } ; //it's gonna be set with minizinc parsed result and the target name
        this.onOilsListClick = this.onOilsListClick.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    componentDidMount(){
        fetch('/getMinizincResults')
            .then(response => response.json())
            .then((result) => {
                

                this.setState({target: result['Target name:'], result: result});
                
            },
            (error)=>{
            console.log(error);  
            }); 
    }

    onOilsListClick(e){
        fetch('/changeTarget',{
            method: 'PUT',
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({previousTarget: this.state.target, nextTarget: e.target.text})
        })
            .then(response => response.json())
            .then((result)=>{
                console.log(result);
            })
    }

    onButtonClick(){
        this.setState({isLoading: true});
        fetch('/getMinizincResults')
            .then(response => response.json())
            .then((result) => {
            this.setState({target: result['Target name:'], result: result, isLoading: false});
            },
            (error)=>{
            console.log(error);  
            });
    }

    render(){
        if (this.state.result){
            const buttonStyles = {
                display: 'flex',
                alignItems: 'center'
            }
            return (
                <BrowserRouter>
                <Navbar className="bg-olive" expand="lg" sticky='top'>
                    <Navbar.Brand href="">OZinc</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto">
                            <NavItem href="/">
                                <NavLink as={Link} to="/">Home</NavLink>
                            </NavItem>
                            <NavItem href="/data">
                                <NavLink as={Link} to="/data">Concentrazioni</NavLink>
                            </NavItem>
                            
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <Switch>
                    <Route path="/data">
                        <ChangeInputData/>
                    </Route>
                    <Route path="/">
                        <div style={{
                            display: 'flex',
                            width: '30%',
                            height: '50px',
                            alignItems: 'center', 
                            justifyContent: 'flex-start'
                        }}>
                        <DropdownButton 
                            title="Target" 
                            id={"dropdown-variants-primary"} 
                            variant="primary" 
                            style={{
                                margin: '20px'
                            }}>
                                {Object.keys(this.state.result["Oils Composition:"]).map((oil_names, index) => (
                                    <Dropdown.Item eventKey={'navdropdown'+oil_names} onClick={this.onOilsListClick}>{oil_names}</Dropdown.Item> 
                                ))}
                            
                        <Dropdown.Item eventKey={'navdropdown_target'} style={{color: '#708238'}} onClick={this.onOilsListClick}>{this.state.result['Target name:']}</Dropdown.Item>
                        </DropdownButton>
                        <Button variant="primary" disabled={this.isLoading} 
                            onClick={this.onButtonClick}
                            style={{
                                margin: '20px'
                            }}>
                            {this.isLoading ? 'Loading…' : 'Calcola'}
                        </Button>
                        </div>
                        <OilsTable results={this.state.result} />
                    </Route>
                </Switch>
            </BrowserRouter>
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

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
