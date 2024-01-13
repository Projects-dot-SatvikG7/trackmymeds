// Import everything needed to use the `useQuery` hook
import { useQuery, gql } from '@apollo/client';
import "./App.css"
const GET_LOCATIONS = gql`
  query Records {
    queryRecord {
      id
      date
      symptom
    }
  }
`;
function DisplayRecords() {
  const { loading, error, data } = useQuery(GET_LOCATIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      <table id='records'>
        <tr>
          <th>ID</th>
          <th>Date</th>
          <th>Symptoms</th>
        </tr>
        {data.queryRecord.map((data) => (
          <tr>
            <td>{data.id}</td>
            <td>{data.date}</td>
            <td><ul>{
              data.symptom.map(s => (
                <li>
                  {s}
                </li>
              ))}</ul></td>
          </tr>
        ))}
      </table>

    </div>
  );
}
export default function App() {
  return (
    <div>
      <h1>TrackMyMeds</h1>
      <br />
      <DisplayRecords />
    </div>
  );
}
