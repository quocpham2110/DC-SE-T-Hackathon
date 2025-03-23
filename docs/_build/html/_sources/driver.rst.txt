Driver Documentation
===========================

This section explains the functionality that allows bus drivers to update the status of their buses and communicate directly with users, ensuring they are informed about the current status of the bus they are waiting for.

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   driver_panel

Driver Overview
---------------

The system enables bus drivers to take control of the bus status, allowing them to update and communicate important information to users, such as whether the bus is in service or unavailable.

### Problem Addressed
One of the challenges Durham Region faces is the slow process of notifying passengers when a bus is no longer in service or when something unexpected happens. This system aims to solve that issue by giving drivers the ability to update the bus status in real-time.

### Driver Functionality
- **Status Updates**: Drivers can update the status of the bus they are operating. For example, they can mark the bus as "Not in Service" if there are issues, or update the status if there are delays or other incidents.
- **User Communication**: Once the driver updates the bus status, users waiting for that bus are immediately notified of the changes, ensuring they are informed in real-time.

### Technology Stack
- **Frontend**: Built using React, Vite, and TypeScript, providing a fast and responsive interface for bus drivers.
- **Driver-Friendly Panel**: The system includes a user-friendly panel that allows drivers to log in securely and easily change the status of their bus. The interface is designed to be intuitive, ensuring that drivers can make updates quickly and efficiently.

