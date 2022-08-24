# Server

This must be simple...
Use serialPort package to read data from Arduino and use express to send data to client.

## To run properly this server you need... 
### Have the client builded

run "npm run build" on the client folder to have a FrontEnd to show.

### Have the file for the environment variables madded 

create an ".env" file in this folder that contains:
```
# DataBase Password
DB_PASS=YourPassWord

# Port (default is 80)
PORT=APortOfYourChoice

#arduino constants
UART_PORT=ComOrTTYPathDependingTheOS
#Default baud is 115200
BAUD_RATE=115200
```