import React, { useState, useEffect } from "react";
import { BarChart, PieChart } from "@mui/x-charts";
import { getExpense, getBalanceAmounts, getCashFlowFriends, getMonthlyExpenses, getCashFlowGroups } from "./service";
import { toast } from "sonner";
import LoadingSkeleton from "./LoadingSkeleton";
import NoDataMessage from "./NoDataMessage";

const DashboardPage: React.FC = () => {
  const [loaders, setLoaders] = useState({
    pieChart1: true,
    pieChart2: true,
    pieChart3: true,
    pieChart4: true,
    barChart: true,
  });

  const [pieChartData1, setPieChartData1] = useState<any>({ data: [] });
  const [pieChartData2, setPieChartData2] = useState<any>({ data: [] });
  const [pieChartData3, setPieChartData3] = useState<any>({ data: [] });
  const [pieChartData4, setPieChartData4] = useState<any>({ data: [] });
  const [barChartData, setBarChartData] = useState<any>({ data: [] });

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [years] = useState<number[]>([currentYear - 2, currentYear - 1, currentYear]);

  // Fetch static chart data (runs only on mount)
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [expenseData, balanceData, cashFlowFriendsData, cashFlowGroupsData] = await Promise.all([
          getExpense(),
          getBalanceAmounts(),
          getCashFlowFriends(),
          getCashFlowGroups(),
        ]);

        setPieChartData1(expenseData[0]);
        setPieChartData2(balanceData[0]);
        setPieChartData3(cashFlowFriendsData[0]);
        setPieChartData4(cashFlowGroupsData[0]);

        setLoaders((prev) => ({
          ...prev,
          pieChart1: false,
          pieChart2: false,
          pieChart3: false,
          pieChart4: false,
        }));
      } catch (error) {
        toast.error("Error fetching data");
      }
    };

    fetchStaticData();
  }, []); // Runs only on mount

  // Fetch monthly expenses (runs when year changes)
  useEffect(() => {
    const fetchMonthlyExpenses = async () => {
      try {
        const [monthlyExpensesData] = await Promise.all([getMonthlyExpenses(year)]);

        setBarChartData(monthlyExpensesData[0]);
        setLoaders((prev) => ({ ...prev, barChart: false }));
      } catch (error) {
        toast.error("Error fetching monthly expenses data");
      }
    };

    setLoaders((prev) => ({ ...prev, barChart: true })); // Set loading for BarChart before fetching
    fetchMonthlyExpenses();
  }, [year]); // Runs when year changes

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(event.target.value));
  };

  const hasNonZeroData = (data: any) => {
    return data && Array.isArray(data.data) && data.data.some((item: any) => item.value !== 0);
  };

  return (
    <div className="w-full p-4 space-y-4">
      {/* Pie Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[
          { title: "Number of Expenses by Amount Range", data: pieChartData1, loader: loaders.pieChart1 },
          { title: "Balance Amount", data: pieChartData2, loader: loaders.pieChart2 },
          { title: "Top Cash Flow Partners", data: pieChartData3, loader: loaders.pieChart3 },
          { title: "Top Cash Flow Groups", data: pieChartData4, loader: loaders.pieChart4 },
        ].map(({ title, data, loader }, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-md flex flex-col items-center justify-between h-[320px] col-span-1">
            <h5 className="text-base font-semibold text-center">{title}</h5>
            {loader ? (
              <LoadingSkeleton />
            ) : hasNonZeroData(data) ? (
              <PieChart
                colors={["#5C85D6", "#4A72C2", "#8559C1", "#7E57C2", "#6A4BA2"]}
                series={[{
                  ...data,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                }]}
                slotProps={{
                  legend: {
                    direction: "column",
                    position: { vertical: "bottom", horizontal: "right" },
                    padding: 0,
                    labelStyle: {
                      fontSize: 8,
                    },
                  },
                }}
                width={300}
                height={200}
              />
            ) : (
              <NoDataMessage />
            )}
          </div>
        ))}
        <div className="bg-white rounded-xl p-4 shadow-md w-full h-[320px] flex flex-col md:col-span-2 xl:col-span-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h5 className="text-base font-semibold">Monthly Expenses</h5>
            <select
              className="bg-amber-50 px-2 py-1 border rounded-md focus:ring focus:ring-amber-200"
              value={year}
              onChange={handleYearChange}
            >
              {years.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {loaders.barChart ? (
            <LoadingSkeleton />
          ) : hasNonZeroData(barChartData) ? (
            <BarChart
              xAxis={[
                {
                  data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  dataKey: "month",
                  scaleType: "band",
                },
              ]}
              series={[{ ...barChartData, color: "#673AB7" }]}
              height={250}
            />
          ) : (
            <NoDataMessage />
          )}
        </div>
      </div>

      {/* Bar Chart */}
      {/* <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md w-full h-[320px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h5 className="text-base font-semibold">Monthly Expenses</h5>
            <select
              className="bg-amber-50 px-2 py-1 border rounded-md focus:ring focus:ring-amber-200"
              value={year}
              onChange={handleYearChange}
            >
              {years.map((year, index) => (
                <option key={index} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          {loaders.barChart ? (
            <LoadingSkeleton />
          ) : hasNonZeroData(barChartData) ? (
            <BarChart
              xAxis={[
                {
                  data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  dataKey: "month",
                  scaleType: "band",
                },
              ]}
              series={[{ ...barChartData, color: "#673AB7" }]}
              height={250}
            />
          ) : (
            <NoDataMessage />
          )}
        </div>
      </div> */}
    </div>
  );
};

export default DashboardPage;
