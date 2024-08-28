import React from 'react';
import { Header } from './components/Header';
import { Balance } from './components/Balance';
import { IncomeExpenses } from './components/incomeExpenses';
import { TranscationList } from './components/TranscationList';
import { AddTransaction } from './components/AddTransaction';
import { GlobalProvider } from './context/GlobalState';



import './App.css'


function App() {
  return (
    <GlobalProvider>
      <Header />
      <div className='container'>
        <Balance />
        <IncomeExpenses />
        <TranscationList />
        <AddTransaction />
      </div>
    </GlobalProvider>
  )
}


export default App;
