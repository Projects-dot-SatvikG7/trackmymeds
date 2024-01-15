import { useQuery, gql } from '@apollo/client';
import "./App.css"
import { useState } from 'react';
const GET_RECORDS = gql`
  query Records {
    queryRecord {
      id
      date
      symptom
    }
  }
`;

function AddData() {

  const [data, setData] = useState([
    { "itching": false },
    { "watery_eyes": false },
    { "runny_nose": false },
    { "sneezing": false },
    { "nasal_inflammation": false },
    { "swollen_throat": false }
  ])

  const toggle = (idx, key) => {
    let newData = data;
    newData[idx][key] = newData[idx][key] ? false : true;
    setData(newData);
    console.log(data)
  }

  if (data) return (
    <div>
      <div>
        {
          data.map((d, idx) => {
            const key = Object.keys(d);
            return (
              <button key={idx} className={String(d[key])} onClick={() => toggle(idx, key)}>
                {key}:
              </button>
            )
          })
        }
      </div>
      <button>Add Data Point</button>
    </div>
  )
}

function DisplayRecords() {
  const { loading, error, data } = useQuery(GET_RECORDS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      <table id='records'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Symptoms</th>
          </tr>
        </thead>
        <tbody>
          {data.queryRecord.map((data) => (
            <tr key={data.id}>
              <td>{data.id}</td>
              <td>{data.date}</td>
              <td><ul>{
                data.symptom.map(s => (
                  <li key={s}>
                    {s}
                  </li>
                ))}</ul></td>
            </tr>
          ))}
        </tbody></table>

    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>TrackMyMeds</h1>
      <br />
      <AddData />
      <br />
      <DisplayRecords />
    </div>
  );
}
