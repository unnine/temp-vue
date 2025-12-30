package iit.components.controller;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HelloServlet {

    @RequestMapping("/main")
    public String main(){
        return "main";
    }

    @RequestMapping("/test-request")
    public String request(){
        return "request";
    }

    @RequestMapping("/test-receipt")
    public String receipt(){
        return "receipt";
    }

}