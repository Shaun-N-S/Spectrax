import React, { useState, useEffect } from "react"
import { format, subDays, subWeeks, subMonths, parseISO } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import axiosInstance from "@/axios/adminAxios"
import { toast } from "react-hot-toast"
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';



const SalesReport = () => {
  const [reportType, setReportType] = useState("daily")
  const [startDate, setStartDate] = useState(subDays(new Date(), 7))
  const [endDate, setEndDate] = useState(new Date())
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSalesData()
  }, [reportType, startDate, endDate])

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/sales-report", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dateRange: reportType,  // reportType can be 'daily', 'weekly', 'monthly', 'yearly', or 'custom'
        },
      });
  
      if (response.data.data && response.data.data.length > 0) {
        setSalesData(response.data.data);
      } else {
        toast.error("No sales data available for the selected range.");
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Failed to fetch sales report.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const generateMockData = () => {
    const data = []
    let currentDate = startDate
    while (currentDate <= endDate) {
      data.push({
        date: format(currentDate, "yyyy-MM-dd"),
        sales: Math.floor(Math.random() * 10000),
        orders: Math.floor(Math.random() * 100),
        discount: Math.floor(Math.random() * 1000),
        couponDiscount: Math.floor(Math.random() * 500),
        totalSales: Math.floor(Math.random() * 10000),
        totalOrders: Math.floor(Math.random() * 100),
        totalDiscount: Math.floor(Math.random() * 1000),
        totalProductsSold: Math.floor(Math.random() * 500),
      })
      currentDate = reportType === "daily" ? subDays(currentDate, -1) : subWeeks(currentDate, -1)
    }
    return data.reverse()
  }

  const handleReportTypeChange = (value) => {
    setReportType(value)
    switch (value) {
      case "daily":
        setStartDate(subDays(new Date(), 7))
        break
      case "weekly":
        setStartDate(subWeeks(new Date(), 4))
        break
      case "monthly":
        setStartDate(subMonths(new Date(), 12))
        break
      case "yearly":
        setStartDate(subMonths(new Date(), 60))
        break
    }
    setEndDate(new Date())
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
  }

  const handleGenerateReport = () => {
    fetchSalesData()
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
  
    
    const storeName = "SPECTRAX"; 
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(storeName, 14, 20);  
  
    
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);  
  
    
    doc.setFontSize(12);
    doc.setTextColor(70);
    doc.text(`Sales Report: ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`, 14, 35);
  
   
    const tableHeaders = ['Date', 'Total Sales', 'Total Orders', 'Total Discount', 'Products Sold'];
  
  
    const tableRows = salesData.map(row => [
      row.date,
      `₹${row.totalSales.toLocaleString()}`,
      row.totalOrders,
      `₹${row.totalDiscount.toLocaleString()}`,
      row.totalProductsSold
    ]);
  
    // Add table to the PDF with styled headers
    doc.autoTable({
      startY: 40,  // Adjust start position based on content above
      head: [tableHeaders],
      body: tableRows,
      theme: 'striped',  // Striped rows for a more professional look
      headStyles: {
        fillColor: [0, 102, 204],  
        textColor: [255, 255, 255],  // Header text color
        fontSize: 12,  // Font size for headers
      },
      bodyStyles: {
        fontSize: 10,  // Font size for table body
        cellPadding: 6,  // Padding within table cells
      },
      footStyles: {
        fillColor: [0, 102, 204],  // Footer row color
        textColor: [255, 255, 255],  // Footer text color
      },
      margin: { top: 40 },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,  // Thin borders for table cells
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],  // Light gray alternate row color
      },
    });
  
    // Add footer with page number
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }
  
    // Save the PDF
    doc.save('Sales_Report.pdf');
  };

  const handleDownloadExcel = () => {
    // Create a worksheet from sales data
    const worksheet = XLSX.utils.json_to_sheet(
      salesData.map((row) => ({
        Date: row.date,
        'Total Sales': `₹${row.totalSales.toLocaleString()}`,
        'Total Orders': row.totalOrders,
        'Total Discount': `₹${row.totalDiscount.toLocaleString()}`,
        'Products Sold': row.totalProductsSold,
      }))
    );
  
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Append the worksheet
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
  
    // Export the Excel file
    XLSX.writeFile(workbook, 'Sales_Report.xlsx');
  };

  const calculateTotals = () => {
    return salesData.reduce(
      (acc, curr) => {
        acc.totalSales += curr.totalSales
        acc.totalOrders += curr.totalOrders
        acc.totalDiscount += curr.totalDiscount
        acc.totalProductsSold += curr.totalProductsSold
        return acc
      },
      { totalSales: 0, totalOrders: 0, totalDiscount: 0, totalProductsSold: 0 },
    )
  }

  const { totalSales, totalOrders, totalDiscount, totalProductsSold } = calculateTotals()

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Sales Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select onValueChange={handleReportTypeChange} defaultValue={reportType}>
          <SelectTrigger>
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="custom">Custom Date Range</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(startDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(endDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
          </PopoverContent>
        </Popover>

        <Button onClick={handleGenerateReport}>Generate Report</Button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-lg font-medium">Total Sales</p>
          <p className="text-2xl font-bold">₹{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-lg font-medium">Total Orders</p>
          <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-lg font-medium">Total Discount</p>
          <p className="text-2xl font-bold">₹{totalDiscount.toLocaleString()}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-lg font-medium">Products Sold</p>
          <p className="text-2xl font-bold">{totalProductsSold.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Sales Chart</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Total Sales" />
              <Line type="monotone" dataKey="totalOrders" stroke="#82ca9d" name="Total Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Detailed Report</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Products Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>₹{row.totalSales.toLocaleString()}</TableCell>
                  <TableCell>{row.totalOrders}</TableCell>
                  <TableCell>₹{row.totalDiscount.toLocaleString()}</TableCell>
                  <TableCell>{row.totalProductsSold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
        <Button onClick={handleDownloadExcel}>Download Excel</Button>
      </div>
    </div>
  )
}

export default SalesReport

