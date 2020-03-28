# OZinc_Web

# GETTING STARTED

*npm install* per installare le dipendenze.
*npm start* per buildare react, e lanciare il server (vedi package.json).

# Backend

* *server.js* carica tutti i middleware, tra cui anche i router in *routes* e lancia il server. Utilizza anche un modulo per semplice autenticazione
(per ora username e password sono costanti con scope globale ma andrebbero messe in un .env ignorato da git, anche se la repo è privata).
* *utils.js* contiene alcune funzioni usate per parsare i file di minizinc
* *ResultParser.js* classe che parsa la stringa di output di minizinc e ritorna un oggetto da fornire al client. Itera sulle righe del risultato, aggiornando ogni volta la chiave corrente.
* *routes/index.js* lancia Minizinc in background e recupera i risultati con ResultParser. L'eseguibile di MiniZinc è linkato staticamente. Inoltre implementa la funzionalità di scelta del target, che comporta la modifica del file di dati, in particolare lo scambio di una colonna della stringa delle concentrazioni con l'array delle concentrazioni del target.
* *routes/data.js* fornisce ednpoint per recuperare i dati del modello per mostrarli nella tabella dei dati, e endpoint per la modifica dei dati. Come nel caso della scelta dinamica del target, il file dei dati viene letto, viene trovata la variabile del modello che deve essere aggiornata, e in quella parte di stringa, viene effettuata una sostituzione "totale" (e.g. se solo due elementi della matrice delle concentrazioni sono stati cambiati, è comunque tutta la matrice che viene sostituita nella stringa).
* *name_map.json* questo file mappa i nomi dei VOC nel modello con i nomi mostrati nell'applicazione all'utente. Questo livello d'indirezione è necessario perché l'utente può modificare i nomi dei VOC, ma non si può rischiare che crei dei nomi di variabile non accettati da MiniZinc (e.g. con degli spazi)

La modifica del file dei dati è protetta da un modulo che fornisce delle operazioni semaphore-like, astraendo un'implementazione tramite code per le richieste I/O (JS è single thread ma ci possono comunque essere inconsistenze nelle modifiche a risorse condivise tra utenti diversi).

# Frontend

* *index.js* è il componente padre, che decide cosa renderizzare a seconda dei risultati di Minizinc. Nel metodo di lifecycle *componentDidMount* infatti inoltra una get al server per chiedere di lanciare Minizinc. A seconda che il modello dia risultati o meno (variabile *noResult*) il componente renderizza rispettivamente la tabella dei risultati o un semplice paragrafo che avvisi l'utente dell'assenza di soluzioni.
Usa react router e una navbar per gestire la navigazione. All'interno del router viene indicato il componente figlio da renderizzare.
Gestisce anche gli eventi legati al bottone *Calcola* e *Target*, con handler registrati nel costruttore. Il componente chiede quindi al server di lanciare Minizinc sia ogni volta che viene montato sull'albero del DOM, sia quando viene premuto dall'utente il bottone per calcolare i risultati.
* *Table.js* la tabella che viene renderizzata nella pagina principale coi risultati. (vd. react bootstrap table)
* *ChangeInputData.js* il componente che gestisce tabella di modifica dei dati e campi di input numerico nella pagina secondaria /data. Mantiene diverse variabili che in realtà contengono gli stessi dati dello stato del componente, perché lo stato potrebbe non essere aggiornato quando l'utente preme sul bottone *salva* per salvare sul server i cambiamenti eseguiti. Implementa i metodi di callback per gestire l'aggiornamento degli input numerici, su cui esegue dei check di valori massimi o minimi. Nella tabella inoltre implementa una regex per validare solo input numerici, e rende non editabili i campi vuoti ('/'). Implementata con react-boostrap-table-next.
