import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import '../assets/style/Diagnostics.css';
import {
  getOrders,
  verifyAndSegregateOrder,
  toggleReadyForBox
} from '../DataStorage/patientData';

import SearchLabOrders from './Diagnostics/SearchLabOrders';
import SampleCollection from './Diagnostics/SampleCollection';
import VerifyBarcode from './Diagnostics/VerifyBarcode';
import LabOrdersPrint from './Diagnostics/LabOrdersPrint';
import Toast from './common/Toast';

function Diagnostics() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Initial load of patient orders from LocalStorage
  useEffect(() => {
    const loadedOrders = getOrders();
    setOrders(loadedOrders);
    if (loadedOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(loadedOrders[0].id);
    }
  }, []);

  // Currently selected order object
  const selectedOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    if (!selectedOrderId) return orders[0];
    return orders.find(o => o.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  // Handler: Perform Order Verification & Segregation, navigate to VerifyBarcode page
  const handleVerifyOrder = (orderId) => {
    verifyAndSegregateOrder(orderId);
    const refreshed = getOrders();
    setOrders(refreshed);
    setSelectedOrderId(orderId);
    setToastMessage(`Lab Order ${orderId} verified & tube barcodes segregated!`);
    navigate('/diagnostics/verify_barcode');
  };

  // Handler: View Barcodes for Verified Order
  const handleViewOrderBarcodes = (orderId) => {
    setSelectedOrderId(orderId);
    navigate('/diagnostics/verify_barcode');
  };

  // Handler: Open Order in Print View
  const handlePrintOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setToastMessage(`Requisition print view loaded for Order ${orderId}`);
    navigate('/diagnostics/lab_orders_print');
  };

  // Handler: Toggle Ready for Box
  const handleToggleReadyForBox = (orderId, barcodeValue) => {
    const updatedList = toggleReadyForBox(orderId, barcodeValue);
    setOrders(updatedList);
  };

  return (
    <div className="diag-container">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      {/* Separate Dedicated Sub-Page Routing for Diagnostics Dropdown Items */}
      <Routes>
        <Route
          path="search_lab_orders"
          element={
            <SearchLabOrders
              orders={orders}
              onVerifyOrder={handleVerifyOrder}
              onViewOrderBarcodes={handleViewOrderBarcodes}
              onPrintOrder={handlePrintOrder}
            />
          }
        />

        <Route
          path="sample_collection"
          element={
            <SampleCollection
              onCompleteCollection={() => navigate('/diagnostics/verify_barcode')}
            />
          }
        />

        <Route
          path="verify_barcode"
          element={
            <VerifyBarcode
              selectedOrder={selectedOrder}
              orders={orders}
              onSelectOrder={(id) => setSelectedOrderId(id)}
              onToggleReadyForBox={handleToggleReadyForBox}
              onBackToSearch={() => navigate('/diagnostics/search_lab_orders')}
            />
          }
        />

        <Route
          path="lab_orders_print"
          element={
            <LabOrdersPrint
              selectedOrder={selectedOrder}
              orders={orders}
              onSelectOrder={(id) => setSelectedOrderId(id)}
              onBackToSearch={() => navigate('/diagnostics/search_lab_orders')}
            />
          }
        />

        {/* Default Fallback Redirect */}
        <Route path="*" element={<Navigate to="search_lab_orders" replace />} />
      </Routes>
    </div>
  );
}

export default Diagnostics;
