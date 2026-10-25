package com.SIGA.SIGA;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SigaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SigaApplication.class, args);
	}

}