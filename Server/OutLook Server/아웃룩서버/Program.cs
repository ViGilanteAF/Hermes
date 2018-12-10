using MySql.Data;//DB연동을위한 DLL파일을 참조함 솔루션 탐색기에 추가해놈 일단 몰라서 선언해봄
//
using MySql.Data.MySqlClient;
//
using System;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.IO;
using System.Threading;
using System.Security.Cryptography;

namespace Blog_Server20121004
{


    class Program
    {
       public static bool run = true; //DB 연동을 1번만 하기위한 변수
        public static MySqlConnection coon = null;
        public static MySqlCommand cmd1 = null;
        public static MySqlDataReader rdata1 = null;
        //public static int 
       // public static string strcon;
        public static int 판단=0;
        //using (run);


        //구문의 집합/////////////////////////////////////////////////////////////////////////////////
        public static string 전송구문 = "";

        public static string 읽음 = " update Target SET Targ_Click = 1, Targ_Click_Time = CURRENT_TIMESTAMP WHERE Emp_No= ";
        public static string 삭제 = " update Target SET Targ_Delete = 1, Targ_Delete_Time = CURRENT_TIMESTAMP WHERE Emp_No= ";
        public static string 스팸 = " update Target SET Targ_Spam = 1, Targ_Spam_Time = CURRENT_TIMESTAMP WHERE Emp_No= ";

        public static string 첨부다운 = " update Target SET Targ_FileClick = 1, Targ_FileClick_Time = CURRENT_TIMESTAMP WHERE Emp_No= ";
        // public static string 첨부삭제 = " update Target SET Targ_Receve = 1, Targ_Receve_Time = CURRENT_TIMESTAMP WHERE Emp_No= ";
        public static string 워드 = " update Target SET Targ_FileClick = 1, Targ_FileClick_Time = CURRENT_TIMESTAMP WHERE Emp_No= ";
        public static string 훈련번호확인 = " and Train_No = ";
        //구문 집합 끝////////////////////////////////////////////////////////////////////////////////////

        public static void database(string 동작인자)//함수
        {
           // string seleck = " insert into test(bb) values(1);";
                      // char asd123 = ' ';
           // asd123 = 동작인자[0];
            Console.WriteLine(동작인자);

           



            //(1)


            if (run==true)//1번만 동작시킬 코드
            {
                             
                try
                {
                    //(1) 1번은 전역으로해서 전역 객체를 생성하여 db함수내에서는 인수를 받아
                    //인수 값에의해 회원 번호와 동작박식 읽거나 삭제하거나 를 따로 저장시키는 동작을 한다
                    // 일단 생성하는거라 1번만 하게 해놨는데 좀더 봐야할듯
                    //cmd1.CommandType = CommandType.Text;

                    string strcon = "Server=localhost; Database=o2;uid=root;Pwd=111111;SslMode=none;";
                    coon = new MySqlConnection(strcon);//DB
                    cmd1 = new MySqlCommand("", coon);

                    Console.WriteLine("DB연결 정상처리중");
                    coon.Open();
                    Console.WriteLine("DB오픈 정상처리중");
                    run = false;


                    //coon.Close();

                }
                catch (Exception ex)//잘 작동함 확인 법 : 위의 strcon의 비번이나 아이디를 이상하게하면 잡히는것을 볼수있음
                {
                    Console.WriteLine("문제 발생 코드 : ");
                    Console.WriteLine(ex.Message.ToString());
                    //run = false;
                    coon.Close();
                    Console.WriteLine("클로즈");
                    //종료 함수 넣으면됨
                }


            }



            if(run == false)
            {


                Console.WriteLine("클로즈 입장");

                cmd1 = new MySqlCommand(동작인자, coon); //
                // cmd1 = new MySqlCommand(seleck, coon)
                // cmd1 = new MySqlCommand(seleck, coon);
                // rdata1 = cmd1.ExecuteReader();
                cmd1.ExecuteNonQuery();
                /*
                if (동작인자[0] == '1')//각각의 상태 처리 메일 읽음 = 1
                {
                    while (rdata1.Read())//실험용 데이터 가져오기
                    {
                       // var lvt = new ListViewItem

                       // b1.AppendLine(rdata1.GetString("mycolumn"));
                        name += rdata1.GetString(0);//가져온값 변수에 저장
                       // name = rdata1;
                    }
                    */
                // this.txtResults.Text = 

                if (판단 == 5)
                {
                    coon.Close();
                }
                판단++;
                cmd1 = null;
                Console.WriteLine("클로즈");

            }



        }

        //AE_S128 복호화
        public static String AESDecrypt128(String Input, String key)
        {
            RijndaelManaged RijndaelCipher = new RijndaelManaged();

            byte[] EncryptedData = Convert.FromBase64String(Input);
            byte[] Salt = Encoding.ASCII.GetBytes(key.Length.ToString());

            PasswordDeriveBytes SecretKey = new PasswordDeriveBytes(key, Salt);
            ICryptoTransform Decryptor = RijndaelCipher.CreateDecryptor(SecretKey.GetBytes(32), SecretKey.GetBytes(16));
            MemoryStream memoryStream = new MemoryStream(EncryptedData);
            CryptoStream cryptoStream = new CryptoStream(memoryStream, Decryptor, CryptoStreamMode.Read);

            byte[] PlainText = new byte[EncryptedData.Length];

            int DecryptedCount = cryptoStream.Read(PlainText, 0, PlainText.Length);

            memoryStream.Close();
            cryptoStream.Close();

            string DecryptedData = Encoding.Unicode.GetString(PlainText, 0, DecryptedCount);

            return DecryptedData;
        }


        //출처: http://h5bak.tistory.com/148 [이준빈은 호박머리]

        static void Main(string[] args)
        {
           
          

            new Program();//통신

        }

        public class dataall//비동기 버퍼를 위한 객체
        {
            public Byte[] _data;
            public Socket _soket;
        }


        public static void receiveback( IAsyncResult asyncResult/* 인자는 비동기 호출이 완료될대 신호를 주는 머시기라고함 F1눌러서 봄*/)
        {
            string readdata = "";
            int indexalpa = 0;
            int indexbeta = 0;
            int indexgamma = 0;
            int lastindex = 0;
            //  string sql = "select * from test";


            //  MySqlDataAdapter dns = new MySqlDataAdapter(sql, coon);

            dataall receivdata = asyncResult.AsyncState as dataall;// as 가 뭔지모름 C#문법인듯 책에서의 rcvData(C#6.0 책 490p)

            int nrecv = receivdata._soket.EndReceive(asyncResult);//뭔지모름 일단 느낌은 리시브 끝나면 뭐 처리해서 인트형 변수에 카운트 하는듯
            string txt = Encoding.UTF8.GetString(receivdata._data, 0, nrecv);//비동기적 버퍼로써 받은 데이터를 유니코드로 처리하여 저장하는것 같다
            string gg1 = null;
            Console.WriteLine("전송받은 원본 데이터");
            Console.WriteLine(txt+"\n");

            readdata = AESDecrypt128(txt, "KIM");

            Console.WriteLine("복호화된 데이터 전문");
            Console.WriteLine(readdata+"\n");

            indexalpa = readdata.IndexOf('α');
            indexbeta = readdata.IndexOf('β');
            indexgamma = readdata.IndexOf('γ');
            // Console.WriteLine("%d  :  %d", indexalpa, indexbeta);

            lastindex = (indexbeta - indexalpa) - 1;

            Console.WriteLine("복호화된 데이터 해석 : 회원번호 " + readdata.Substring(indexalpa + 1, lastindex) + "님이 ");
            //database(readdata);
           // database(seleck); 

            if (readdata[0] == '1')
            {
                Console.WriteLine("훈령용 메일을 [열람] 하셨습니다.");
               
                전송구문 = 읽음;
                전송구문 += readdata.Substring(indexalpa + 1, lastindex) + 훈련번호확인 + readdata.Substring(indexbeta+1, (indexgamma - indexbeta) - 1) +';';
                //gg1 = readdata.Substring(indexbeta + 1, indexbeta - 2);
                //Console.WriteLine(전송구문);
                database(전송구문);


            }
            else if (readdata[0] == '2')
            {
                Console.WriteLine("훈령용 메일을 [삭제] 하셨습니다.");
                전송구문 = 삭제;
                전송구문 += readdata.Substring(indexalpa + 1, lastindex) + 훈련번호확인 + readdata.Substring(indexbeta + 1, (indexgamma - indexbeta) - 1) + ';';
                database(전송구문);
            }
            else if (readdata[0] == '3')
            {
                Console.WriteLine("훈령용 메일을 [수신 차단] 하셨습니다.");
                전송구문 = 스팸;
                전송구문 += readdata.Substring(indexalpa + 1, lastindex) + 훈련번호확인 + readdata.Substring(indexbeta + 1, (indexgamma - indexbeta) - 1) + ';';
                database(전송구문);
            }
            else if (readdata[0] == '4')
            {
                Console.WriteLine("훈령용 워드파일을 [실행] 하셨습니다.");
                전송구문 = 워드;
                전송구문 += readdata.Substring(indexalpa + 1, lastindex) + 훈련번호확인 + readdata.Substring(indexbeta + 1, (indexgamma - indexbeta) - 1) + ';';
                /*
                Console.WriteLine("훈령용 메일의 [첨부파일을 다운로드] 받았습니다.");
                전송구문 = 첨부다운;
                전송구문 += readdata.Substring(indexalpa + 1, lastindex) + 훈련번호확인 + readdata.Substring(indexbeta + 1, (indexgamma - indexbeta) - 1) + ';';*/
                database(전송구문);
            }
            else if (readdata[0] == '5')
            {
                Console.WriteLine("훈령용 메일의 [첨부파일을 삭제] 하셨습니다.");
                /*  전송구문 = 삭제;
                  전송구문 += readdata.Substring(indexalpa+1, indexbeta - 2) + 훈련번호확인 + readdata.Substring(indexbeta + 1, indexbeta - 2) +';';
                  database(첨부삭제); 첨부 삭제가 정확히 뭔지몰것음*/
            }
            else if (readdata[0] == '6')
            {
                
                Console.WriteLine("훈령용 워드파일을 [실행] 하셨습니다.");
                전송구문 = 워드;
                전송구문 += readdata.Substring(indexalpa + 1, lastindex) + 훈련번호확인 + readdata.Substring(indexbeta+1, (indexgamma - indexbeta) - 1) +';';
                
                //워드에서 받을 신호 database(워드) 아직 대기
            }



            Console.WriteLine("------------------------------------------------------------");
            /*
             *밑의 코드는 데이터를 받고 데이터를 전송하는 기능을 하는 코드다
             * 
             *하지만 본 서버는 오직 클라이언트에게 메세지를 받는 동작만을 함으로 어더한 데이터도 전송하지않는다.
             * 
            byte[] sendBytes = Encoding.UTF8.GetBytes("안녕하시오: " + txt); 안녕하시오 라는 문자와 함깨 받은 문자 txt 를 함깨 전송
            receivdata._soket.BeginSend(sendBytes,0,sendBytes.Length,SocketFlags.None, receiveback 와 같은 샌드용 함수 , receivdata._soket)
             */

        }




        public Program()
        {

            //http://nowonbun.tistory.com/155
            //그냥 긁어온거 여기서 수신되게 해야됨
            // 수신이되면 수신되는 데이터를 복호화 시킬 수 있게해야됨
            //수신이 되면 그걸 가지고 DB에 업데이트 때려봐야됨
            //그것도 되면 셀렉트 함수? 를 사용하여 다중 클라이언트가 붙을 수 있게해야함

            IPEndPoint ipep = new IPEndPoint(IPAddress.Any, 9999);
            using (Socket serversock = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp))
            {
                //Socket server = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

                serversock.Bind(ipep);
                serversock.Listen(10);

                while (true)
                {
                    Console.WriteLine("Server Start... Listen port 9999...");//시작 문자 + 포트번호 출력
                    
                    Socket client = serversock.Accept();
                    dataall bff = new dataall();

                    IPEndPoint ip = (IPEndPoint)client.RemoteEndPoint;
                    Console.WriteLine("\n 주소 {0} 에서 접속", ip.Address);//접속한 당대의 ip어드레스를 출력



                    bff._data = new Byte[1024];
                    bff._soket = client;

                    client.BeginReceive(bff._data, 0, bff._data.Length, SocketFlags.None, receiveback, bff);// 비동기식 리시브를 위한 함수 receiveback를 위에 선언

                    // String _buf = null;
                    // Byte[] _data = Encoding.Default.GetBytes(_buf);
                    //client.Send(_data);
                    // _data = new Byte[1024];
                    //  client.Receive(_data);
                    //  _buf = Encoding.Default.GetString(_data);
                    //   Console.WriteLine(_buf);
                    // client.Close();
                    // serversock.Close();
                }

            }




        }
    }
}
