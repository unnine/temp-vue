package iit.components.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@EnableWebMvc
@Configuration
public class WebResourceConfig implements WebMvcConfigurer {


    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/components/**")
                .addResourceLocations("/components/");

        registry
                .addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/assets/");

        registry
                .addResourceHandler("/values/**")
                .addResourceLocations("/pages/values/");
    }
}
