# DeFi Data Analysis Tool

A comprehensive tool for fetching and analyzing DeFi market data from DeFi Llama's API.

## Features

- **Real-time Data Collection**: Fetches the latest DeFi market data from multiple endpoints
- **Comprehensive Data Coverage**: Collects data across five major categories:
  - Protocol TVL (Total Value Locked)
  - DEX Volumes
  - Yield Pools
  - Stablecoins
  - Protocol Fees
- **Structured Data Formatting**: Processes raw data into standardized JSON format
- **Historical Data Analysis**: Includes historical volume data from 2016 to present
- **Detailed Metrics**: Captures comprehensive market metrics and changes

## Data Categories

### 1. Protocol TVL Data
- **Entries**: 5,779 protocols
- **Metrics**:
  - Basic Protocol Information
    - Name, ID, Symbol
    - URL and Description
    - Chain and Category
  - TVL Metrics
    - Current TVL
    - 1-day change
    - 7-day change
    - 1-month change
  - Audit Information
  - Module and Listing Details

### 2. DEX Volumes Data
- **Entries**: 3,292 (combined)
- **Data Types**:
  a) Historical Total Volume
     - Daily data from April 2016
     - Total volume per day
  b) DEX-Specific Data
     - Volume by DEX and chain
     - 24-hour volume
     - Volume changes (24h, 7d, 30d)
  c) Volume Summary
     - Total volumes (24h, 7d, 30d, 1y, all-time)
     - Volume changes and trends
     - Historical averages

### 3. Yield Pools Data
- **Entries**: 18,230 pools
- **Metrics**:
  - Basic Pool Information
    - Chain and Project
    - Token Symbol
  - TVL and APY
    - TVL in USD
    - Base APY
    - Reward APY
    - Total APY
  - Risk Metrics
    - Impermanent Loss Risk
    - Exposure Type
  - Predictions
    - Predicted Class
    - Probability
    - Confidence Level

### 4. Stablecoins Data
- **Entries**: 244 stablecoins
- **Metrics**:
  - Basic Information
    - Name and Symbol
    - Price
  - Supply Metrics
    - Circulating Supply
    - Market Cap
  - Chain Distribution
  - Market Changes
    - 24h Price Change
    - 24h Market Cap Change
    - Supply Changes (24h, 7d, 1m)

### 5. Protocol Fees Data
- **Entries**: 918 protocols
- **Metrics**:
  - Protocol Identification
  - Category
  - Fee Metrics
    - 24-hour Fees
    - 24-hour Revenue
  - Change Metrics
    - Fee Changes
    - Revenue Changes

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Install Python dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Install Node.js dependencies:
```bash
npm install
```

## Usage

1. Fetch the latest data:
```bash
python defi_llama_fetcher.py
```

2. Format the data:
```bash
node data_formatter.js
```

The formatted data will be available in the `raw_data` directory.

## Data Structure

All formatted data follows a consistent structure:
```json
{
  "timestamp": "ISO-8601 timestamp",
  // Category-specific metrics
}
```

## Data Freshness

- Data is fetched in real-time from DeFi Llama's API
- Each data point includes a timestamp of when it was collected
- Historical data is preserved for trend analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 