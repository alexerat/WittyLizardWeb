<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TuteeTable
 *
 * @ORM\Table(name="Tutoring.Tutee_Table",
 * indexes={@ORM\Index(name="fk_Tutee_Table_User_ID_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class TuteeTable
{
    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \Doctrine\Common\Collections\Collection|TutorTable[]
     *
     * @ORM\ManyToMany(targetEntity="TuteeTable", inversedBy="tutees")
     * @ORM\JoinTable(name="tutors", joinColumns={@ORM\JoinColumn(name="tutorId", referencedColumnName="user")}, inverseJoinColumns={@ORM\JoinColumn(name="tuteeId", referencedColumnName="user")})
     */
    protected $tutors;
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->tutors = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return TuteeTable
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Add tutor
     *
     * @param \App\Entity\TuteeTable $tutor
     *
     * @return TuteeTable
     */
    public function addTutor(\App\Entity\TuteeTable $tutor)
    {
        $this->tutors[] = $tutor;

        return $this;
    }

    /**
     * Remove tutor
     *
     * @param \App\Entity\TuteeTable $tutor
     */
    public function removeTutor(\App\Entity\TuteeTable $tutor)
    {
        $this->tutors->removeElement($tutor);
    }

    /**
     * Get tutors
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getTutors()
    {
        return $this->tutors;
    }
}
