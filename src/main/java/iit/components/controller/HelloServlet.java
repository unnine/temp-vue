package iit.components.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class HelloServlet {

    @RequestMapping(value = "/main", method = RequestMethod.GET)
    public String main(){
        return "main";
    }

    @RequestMapping(value = "/main2", method = RequestMethod.GET)
    public String main2(){
        return "main";
    }

    @RequestMapping(value = "/main3", method = RequestMethod.GET)
    public String main3(){
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