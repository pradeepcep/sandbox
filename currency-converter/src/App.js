import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';

import axios from 'axios';

// import rates from './rates.js';  // uncomment in developement to load static rates.
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currencies: [],
      fromCurrencyValue: 0.0,
      toCurrencyValue: 0.0,
      fromCurrency: '',
      toCurrency: '',
      baseCurrency: 'USD',
      exchangeRates: {},
      isLoading: true,
    };
    this.updateDataFromApi = this.updateDataFromApi.bind(this);
    this.handleFromValueChange = this.handleFromValueChange.bind(this);
    this.handleFromCurrencyChange = this.handleFromCurrencyChange.bind(this);
    this.handleToCurrencyChange = this.handleToCurrencyChange.bind(this);
  }

  updateDataFromApi() {
    this.setState({
      isLoading: true,
      error: null,
    });
    // use https://mocky.io version in developement to ease load on https://exchangeratesapi.io/.
    // axios.get('https://run.mocky.io/v3/2183ce12-8fd4-444e-bbbd-466bbc81a054')
    axios.get('https://api.exchangeratesapi.io/latest')
      .then((data) => {
        console.log('Successfully loaded data from API!');
        const rates = data.data.rates;
        const currencies = Object.keys(rates);
        this.setState({
          currencies: currencies,
          fromCurrency: currencies[0],
          toCurrency: currencies[currencies.length - 1],
          exchangeRates: rates,
          isLoading: false,
        });
      }, (error) => {
        console.log(error);
        this.setState({
          isLoading: false,
          error: true,
        });
      });
  }

  componentDidMount() {
    this.updateDataFromApi();
  }

  handleFromValueChange(event) {
    const fromValue = event.target.value;
    const baseValue = fromValue / this.state.exchangeRates[this.state.fromCurrency];
    const toValue = baseValue * this.state.exchangeRates[this.state.toCurrency];
    this.setState(() => ({
      fromCurrencyValue: fromValue,
      toCurrencyValue: toValue,
    }));
  }

  handleFromCurrencyChange(event) {
    const fromValue = this.state.fromCurrencyValue;
    const baseValue = fromValue / this.state.exchangeRates[event.target.value];
    const toValue = baseValue * this.state.exchangeRates[this.state.toCurrency];
    this.setState(() => ({
      fromCurrency: event.target.value,
      toCurrencyValue: toValue,
    }));
  }

  handleToCurrencyChange(event) {
    const fromValue = this.state.fromCurrencyValue;
    const baseValue = fromValue / this.state.exchangeRates[this.state.fromCurrency];
    const toValue = baseValue * this.state.exchangeRates[event.target.value];
    this.setState(() => ({
      toCurrency: event.target.value,
      toCurrencyValue: toValue,
    }));
  }

  render() {
    if (this.state.isLoading) {
      return (
        <Grid container justify="center" alignItems="center" direction="column" spacing={1}>
          <h1><span role="img" aria-label="Currency Converter">💸</span></h1>
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      );
    } else if (this.state.error) {
      return (
        <Grid container justify="center" alignItems="center" direction="column" spacing={1} size='lg'>
          <Grid item>
            <h1><span role="img" aria-label="Currency Converter">💸</span></h1>
            <p>An error occurred when trying to load <span role="img" aria-label="">💔</span></p>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={this.updateDataFromApi}>
              Try Again
            </Button>
          </Grid>
        </Grid>
      );
    }
    return (
      <Grid container justify="center" className="root">
        <h1><span role="img" aria-label="Currency Converter" className="text-center">💸</span></h1>
        <Grid item className="from-input">
          <TextField className="mx-1" variant="outlined" label="The amount of" value={this.state.fromCurrencyValue} onChange={this.handleFromValueChange}/>
          <TextField className="mx-1" variant="outlined" select value={this.state.fromCurrency} onChange={this.handleFromCurrencyChange}>
            {this.state.currencies.map((currency, idx) => {
              return (
                <MenuItem key={currency} value={currency}>{currency}</MenuItem>
              );
            })}
          </TextField>
        </Grid>
        <Grid item className="hand-pointer mx-1">
          <div className="pointRight"><span role="img" aria-label="">👉</span></div>
          <div className="pointDown"><span role="img" aria-label="">👇</span></div>
        </Grid>
        <Grid item className="to-input">
          <TextField className="mx-1" variant="outlined" label="is the same as" disabled value={this.state.toCurrencyValue }/>
          <TextField className="mx-1" variant="outlined" select value={this.state.toCurrency} onChange={this.handleToCurrencyChange}>
            {this.state.currencies.map((currency, idx) => {
              return (
                <MenuItem key={currency} value={currency}>{currency}</MenuItem>
              );
            })}
          </TextField>
        </Grid>
      </Grid>
    );
  }
}

export default App;
