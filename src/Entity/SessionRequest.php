<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * SessionRequest
 *
 * @ORM\Table(name="Tutoring.Session_Request",
 * indexes={@ORM\Index(name="fk_Session_Request_Tutee_Table1_idx", columns={"Tutee_ID"}), @ORM\Index(name="fk_Session_Request_Curriculum_Table1_idx", columns={"Curriculum_ID"}), @ORM\Index(name="fk_Session_Request_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class SessionRequest
{

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutee_ID", referencedColumnName="User_ID")
     * })
     */
    private $tuteeId;

    /**
     * @var \App\Entity\CurriculumTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\CurriculumTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    private $currId;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Req_Time", type="datetime")
    */
    private $reqTime;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Session_Time", type="datetime")
    */
    private $sessTime;

    /**
     * @var string
     *
     * @ORM\Column(name="Comment", type="string", length=100, nullable=true)
     */
    private $comment;

    /**
     * Set reqTime
     *
     * @param \DateTime $reqTime
     *
     * @return SessionRequest
     */
    public function setReqTime($reqTime)
    {
        $this->reqTime = $reqTime;

        return $this;
    }

    /**
     * Get reqTime
     *
     * @return \DateTime
     */
    public function getReqTime()
    {
        return $this->reqTime;
    }

    /**
     * Set sessTime
     *
     * @param \DateTime $sessTime
     *
     * @return SessionRequest
     */
    public function setSessTime($sessTime)
    {
        $this->sessTime = $sessTime;

        return $this;
    }

    /**
     * Get sessTime
     *
     * @return \DateTime
     */
    public function getSessTime()
    {
        return $this->sessTime;
    }

    /**
     * Set comment
     *
     * @param string $comment
     *
     * @return SessionRequest
     */
    public function setComment($comment)
    {
        $this->comment = $comment;

        return $this;
    }

    /**
     * Get comment
     *
     * @return string
     */
    public function getComment()
    {
        return $this->comment;
    }

    /**
     * Set tutorId
     *
     * @param \App\Entity\UserTable $tutorId
     *
     * @return SessionRequest
     */
    public function setTutorId(\App\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \App\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }

    /**
     * Set tuteeId
     *
     * @param \App\Entity\UserTable $tuteeId
     *
     * @return SessionRequest
     */
    public function setTuteeId(\App\Entity\UserTable $tuteeId = null)
    {
        $this->tuteeId = $tuteeId;

        return $this;
    }

    /**
     * Get tuteeId
     *
     * @return \App\Entity\UserTable
     */
    public function getTuteeId()
    {
        return $this->tuteeId;
    }

    /**
     * Set currId
     *
     * @param \App\Entity\CurriculumTable $currId
     *
     * @return SessionRequest
     */
    public function setCurrId(\App\Entity\CurriculumTable $currId = null)
    {
        $this->currId = $currId;

        return $this;
    }

    /**
     * Get currId
     *
     * @return \App\Entity\CurriculumTable
     */
    public function getCurrId()
    {
        return $this->currId;
    }
}
