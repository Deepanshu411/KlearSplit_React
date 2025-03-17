import React, { useState, useEffect } from 'react';
import { BarChart, PieChart } from '@mui/x-charts';
import { getExpense, getBalanceAmounts, getCashFlowFriends, getMonthlyExpenses, getCashFlowGroups } from "./dashboardService";

const DashboardPage: React.FC = () => {
  const [loaders, setLoaders] = useState({
    pieChart1: true,
    pieChart2: true,
    pieChart3: true,
    pieChart4: true,
    barChart: true,
  });
  const [pieChartData1, setPieChartData1] = useState<any>(null);
  const [pieChartData2, setPieChartData2] = useState<any>(null);
  const [pieChartData3, setPieChartData3] = useState<any>(null);
  const [pieChartData4, setPieChartData4] = useState<any>(null);
  const [barChartData, setBarChartData] = useState<any>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expenseData, balanceData, cashFlowFriendsData, monthlyExpensesData, cashFlowGroupsData] = await Promise.all([
          getExpense(),
          getBalanceAmounts(),
          getCashFlowFriends(),
          getMonthlyExpenses(year),
          getCashFlowGroups(),
        ]);

        setPieChartData1(expenseData);
        setPieChartData2(balanceData);
        setPieChartData3(cashFlowFriendsData);
        setPieChartData4(cashFlowGroupsData);
        setBarChartData(monthlyExpensesData);
        setYears([2023, 2024, 2025]); // Example years, replace with actual data if available

        setLoaders({
          pieChart1: false,
          pieChart2: false,
          pieChart3: false,
          pieChart4: false,
          barChart: false,
        });
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [year]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.target.value));
  };

  const hasNoneZeroData = (data: any) => {
    return data.datasets[0].data.length > 0;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col">
          {loaders.pieChart1 ? (
            <div className="flex flex-col items-center">
              <h5>Number of Expenses by Amount Range</h5>
              <div className="dots-container flex space-x-2">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          ) : hasNoneZeroData(pieChartData1) ? (
            <PieChart series={pieChartData1} />
          ) : (
            <div className="flex flex-col items-center">
              <h5>Number of Expenses by Amount Range</h5>
              <p>No Data Found</p>
            </div>
          )}
        </div>
        <div className="col">
          {loaders.pieChart2 ? (
            <div className="flex flex-col items-center">
              <h5>Balance Amount</h5>
              <div className="dots-container flex space-x-2">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          ) : hasNoneZeroData(pieChartData2) ? (
            <PieChart series={pieChartData2} />
          ) : (
            <div className="flex flex-col items-center">
              <h5>Balance Amount</h5>
              <p>No Data Found</p>
            </div>
          )}
        </div>
        <div className="col">
          {loaders.pieChart3 ? (
            <div className="flex flex-col items-center">
              <h5>Top Cash Flow Partners</h5>
              <div className="dots-container flex space-x-2">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          ) : hasNoneZeroData(pieChartData3) ? (
            <PieChart series={pieChartData3} />
          ) : (
            <div className="flex flex-col items-center">
              <h5>Top Cash Flow Partners</h5>
              <p>No Data Found</p>
            </div>
          )}
        </div>
        <div className="col">
          {loaders.pieChart4 ? (
            <div className="flex flex-col items-center">
              <h5>Top Cash Flow Groups</h5>
              <div className="dots-container flex space-x-2">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          ) : hasNoneZeroData(pieChartData4) ? (
            <PieChart series={pieChartData4} />
          ) : (
            <div className="flex flex-col items-center">
              <h5>Top Cash Flow Groups</h5>
              <p>No Data Found</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-end px-2">
          <label htmlFor="yearSelect" className="form-label pe-2">Monthly Expenses for</label>
          <span className="dropdown-wrapper">
            <select id="yearSelect" className="px-2 py-1" value={year} onChange={handleYearChange}>
              {years.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </span>
        </div>
        {loaders.barChart ? (
          <div className="flex flex-col items-center">
            <div className="dots-container flex space-x-2">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        ) : hasNoneZeroData(barChartData) ? (
          <BarChart series={barChartData} />
        ) : (
          <div className="flex flex-col items-center">
            <p>No Data Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;