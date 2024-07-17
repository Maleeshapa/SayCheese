import './style.css';
import './responsive.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import Header from './Dashboard header';
import Sidebar from './sidebar';



function Dashboard() {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('https://say-cheese-eta.vercel.app/bookingdetails')
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  };

  const handleDelete = (id) => {
    axios.delete(`https://say-cheese-eta.vercel.app/delete/${id}`)
      .then(res => {
        console.log(res.data);
        fetchData(); // Fetch updated data after successful deletion
      })
      .catch(err => console.log(err));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="dashboard">
      <Header />

      <div className="content">
        <Sidebar />

        <div className="main-container">

          <div className="main">
            

            <div className="report-container" >
              <div className="report-header">
                <h1 className="recent-Articles">Booking Details</h1>
                <Link to='/create' className='btn btn-success'>Create New +</Link>
              </div>

              <div className="report-body">
                <div className="report-topic-heading">
                  <table className="table table-striped " style={{width:"100%"}} >
                    <thead>
                      <tr>
                        <th scope="col " style={{width:"5%"}}>ID</th>
                        <th scope="col " style={{width:"20%"}}>Name</th>
                        <th scope="col " style={{width:"20%"}}>Email</th>
                        <th scope="col " style={{width:"20%"}}>Nic</th>
                        <th scope="col " style={{width:"10%"}}>Type</th>
                        <th scope="col " style={{width:"15%"}}>Date</th>
                        <th scope="col " style={{width:"10%"}}>Message</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody >
                    {data.map((bookingdetails, index) => (
                      <tr key={index}>
                        <td> {bookingdetails._id}</td>
                        <td>{bookingdetails.name} </td>
                        <td> {bookingdetails.email}</td>
                        <td> {bookingdetails.nic}</td>
                        <td> {bookingdetails.type}</td>
                        <td>{formatDate(bookingdetails.date)}</td>
                        <td> {bookingdetails.message}</td>
                        <td>
                        <button onClick={() => handleDelete(bookingdetails._id)} className='btn btn-sm btn-danger'>Delete</button>{' '}
                        </td>
                      </tr>
                    ))}
                      {/* Add more rows as needed */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
